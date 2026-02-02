"""
FounderOS Marketing Agent - Smart Post Generator v2.0

An intelligent content generation agent that understands user intent:
- Generate new posts from scratch on any topic
- Enhance/improve user-provided content
- Translate content style (e.g., make professional, casual, etc.)
- Summarize long content into posts
- Expand brief ideas into full posts

Uses Gemini AI with intelligent fallback to templates.
"""

from typing import TypedDict, Literal, Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import random
import os
import re
import json
import logging

logger = logging.getLogger("marketing_agent")

# ============================================================================
# INTENT TYPES - What the user wants to do
# ============================================================================

class UserIntent(str, Enum):
    """The detected intent from user's query."""
    GENERATE = "generate"      # Create new content from scratch
    ENHANCE = "enhance"        # Improve user-provided content
    TRANSLATE = "translate"    # Change style/tone of content
    SUMMARIZE = "summarize"    # Condense content into a post
    EXPAND = "expand"          # Elaborate on a brief idea
    REPURPOSE = "repurpose"    # Convert content for different platform


class IntentAnalysis(TypedDict):
    """Result of analyzing user's query."""
    intent: str
    confidence: float
    extracted_topic: str
    user_content: Optional[str]
    target_style: Optional[str]
    additional_instructions: Optional[str]


# ============================================================================
# TYPE DEFINITIONS
# ============================================================================

class ContentRequest(TypedDict):
    """What the user wants to post about."""
    topic: str
    platform: Literal["x", "instagram", "facebook", "linkedin", "youtube", "discord"]
    content_type: str
    mood: Optional[str]
    call_to_action: Optional[str]


class GeneratedContent(TypedDict):
    """The AI-generated content ready for review."""
    id: str
    content: str
    platform: str
    hashtags: List[str]
    media_suggestions: Optional[str]
    scheduled_time: Optional[str]
    authenticity_score: float
    revision_count: int
    intent_detected: Optional[str]


# ============================================================================
# CONTENT TEMPLATES (Used when AI is not available)
# ============================================================================

TEMPLATES = {
    "x": [
        "🚀 {topic}\n\nBuild. Ship. Learn.\n\nThat's the only loop that matters.\n\n👇 What are you shipping this week?",
        "Just thinking about: {topic}\n\nSometimes you just have to dive in and figure it out along the way.\n\n#buildinpublic #founder",
        "💡 Insight: {topic}\n\nBefore: Overthinking it.\nAfter: Just doing it.\n\nSimple is better.",
    ],
    "linkedin": [
        "Thinking about: {topic}\n\nIt's easy to get caught up in the noise, but sometimes the signal is right in front of us.\n\nWe're doubling down on this approach.\n\nWhat's your take? 👇\n\n#innovation #strategy #growth",
        "🚀 Major update: {topic}\n\nBuilding in public has taught us one thing: Transparency wins.\n\nHere's why this matters for our journey ahead...\n\n(Link in comments)\n\n#buildinginpublic #startups",
    ],
    "discord": [
        "📢 **Community Update**\n\n**Topic:** {topic}\n\nWe wanted to share this with you all first because this community drives everything we do.\n\n**Discussion:**\nWhat's your take on this? We'd love to hear your thoughts below! 👇",
        "🚀 **Just Dropped**\n\nWe're exploring: **{topic}**\n\nthreads on this have been crazy lately. We think this is a game-changer.\n\nLet's discuss in the chat! 💬",
        "👀 **Sneak Peek**\n\n{topic}\n\nDetailed breakdown coming soon, but we couldn't wait to share the high-level update with you.\n\nReact with 🔥 if you're excited!",
    ],
    "instagram": [
        "✨ {topic}\n\n.\n.\n.\n\nAlways building. Always learning. 🌱\n\n#founder #startup #tech #growth",
        "Behind the scenes: {topic} 📸\n\nCreating something from nothing is the hardest and best job in the world.\n\n#entrepreneurlife #hustle",
    ],
    "facebook": [
        "Update: {topic}\n\nWe're making progress every single day. Thanks for being part of the journey! 🙏",
        "{topic}\n\nBig things coming. Stay tuned! ✨",
    ],
    "youtube": [
        "In this video: {topic}\n\n👇 Timestamps & Links below\n\nDon't forget to subscribe for more updates!",
    ],
}

HASHTAG_POOLS = {
    "x": ["#buildinpublic", "#startup", "#founder", "#tech", "#ai"],
    "linkedin": ["#startup", "#entrepreneurship", "#innovation", "#leadership", "#growth"],
    "instagram": ["#startup", "#entrepreneur", "#founder", "#motivation", "#business"],
    "facebook": ["#startup", "#business", "#entrepreneur"],
    "youtube": [],
    "discord": [],
}


# ============================================================================
# INTENT DETECTION PATTERNS (Fallback when AI unavailable)
# ============================================================================

GENERATE_PATTERNS = [
    r"^write\s+(a\s+)?post\s+about",
    r"^create\s+(a\s+)?post\s+(about|on|for)",
    r"^generate\s+(a\s+)?post",
    r"^make\s+(a\s+)?post\s+about",
    r"^draft\s+(a\s+)?post",
    r"^compose\s+(a\s+)?post",
    r"^I\s+need\s+(a\s+)?post\s+about",
    r"^post\s+about",
    r"^can\s+you\s+write",
    r"^help\s+me\s+write",
]

ENHANCE_PATTERNS = [
    r"improve\s+this",
    r"enhance\s+this",
    r"make\s+this\s+better",
    r"polish\s+this",
    r"refine\s+this",
    r"fix\s+this",
    r"edit\s+this",
    r"rewrite\s+this",
    r"can\s+you\s+improve",
    r"help\s+me\s+improve",
]

TRANSLATE_PATTERNS = [
    r"make\s+(it|this)\s+more\s+\w+",
    r"convert\s+to\s+\w+\s+tone",
    r"change\s+the\s+tone",
    r"make\s+(it|this)\s+sound",
    r"rephrase\s+in\s+\w+\s+style",
]

SUMMARIZE_PATTERNS = [
    r"summarize\s+this",
    r"condense\s+this",
    r"shorten\s+this",
    r"make\s+(it|this)\s+shorter",
    r"turn\s+this\s+into\s+a\s+post",
    r"convert\s+this\s+to\s+a\s+post",
]

EXPAND_PATTERNS = [
    r"expand\s+(on\s+)?this",
    r"elaborate\s+on",
    r"make\s+(it|this)\s+longer",
    r"add\s+more\s+detail",
    r"flesh\s+out",
]


# ============================================================================
# SMART INTENT ANALYZER
# ============================================================================

class IntentAnalyzer:
    """Analyzes user queries to understand their intent and extract relevant information."""
    
    def __init__(self):
        self.model = None
        self._configure_ai()
    
    def _configure_ai(self):
        """Configure Gemini AI if available."""
        try:
            import google.generativeai as genai
            api_key = os.getenv("GOOGLE_API_KEY", "")
            if api_key:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel("models/gemini-2.0-flash")
                logger.info("✅ IntentAnalyzer: Gemini configured")
        except Exception as e:
            logger.warning(f"⚠️ IntentAnalyzer: Could not configure Gemini: {e}")
    
    def _detect_intent_pattern_based(self, query: str) -> IntentAnalysis:
        """Fallback pattern-based intent detection."""
        query_lower = query.lower().strip()
        
        # Check for user-provided content (longer text that looks like a post)
        # Heuristic: If query is long and doesn't start with command words, it's likely content
        word_count = len(query.split())
        has_command_start = any(
            re.match(pattern, query_lower, re.IGNORECASE) 
            for patterns in [GENERATE_PATTERNS, ENHANCE_PATTERNS, TRANSLATE_PATTERNS, SUMMARIZE_PATTERNS, EXPAND_PATTERNS]
            for pattern in patterns
        )
        
        # Check each intent type
        for pattern in ENHANCE_PATTERNS:
            if re.search(pattern, query_lower):
                return IntentAnalysis(
                    intent=UserIntent.ENHANCE.value,
                    confidence=0.8,
                    extracted_topic="content enhancement",
                    user_content=query,
                    target_style=None,
                    additional_instructions=None
                )
        
        for pattern in TRANSLATE_PATTERNS:
            if re.search(pattern, query_lower):
                return IntentAnalysis(
                    intent=UserIntent.TRANSLATE.value,
                    confidence=0.7,
                    extracted_topic="style translation",
                    user_content=query,
                    target_style=None,
                    additional_instructions=None
                )
        
        for pattern in SUMMARIZE_PATTERNS:
            if re.search(pattern, query_lower):
                return IntentAnalysis(
                    intent=UserIntent.SUMMARIZE.value,
                    confidence=0.8,
                    extracted_topic="content summarization",
                    user_content=query,
                    target_style=None,
                    additional_instructions=None
                )
        
        for pattern in EXPAND_PATTERNS:
            if re.search(pattern, query_lower):
                return IntentAnalysis(
                    intent=UserIntent.EXPAND.value,
                    confidence=0.8,
                    extracted_topic="content expansion",
                    user_content=query,
                    target_style=None,
                    additional_instructions=None
                )
        
        for pattern in GENERATE_PATTERNS:
            if re.search(pattern, query_lower):
                # Extract topic from the query
                topic = re.sub(pattern, "", query_lower, flags=re.IGNORECASE).strip()
                return IntentAnalysis(
                    intent=UserIntent.GENERATE.value,
                    confidence=0.9,
                    extracted_topic=topic if topic else query,
                    user_content=None,
                    target_style=None,
                    additional_instructions=None
                )
        
        # If no command pattern but text is substantial (>30 words), assume it's content to enhance
        if word_count > 30 and not has_command_start:
            return IntentAnalysis(
                intent=UserIntent.ENHANCE.value,
                confidence=0.7,
                extracted_topic="user content",
                user_content=query,
                target_style=None,
                additional_instructions=None
            )
        
        # Default: treat as topic for generation
        return IntentAnalysis(
            intent=UserIntent.GENERATE.value,
            confidence=0.6,
            extracted_topic=query,
            user_content=None,
            target_style=None,
            additional_instructions=None
        )
    
    async def analyze(self, query: str, platform: str = "linkedin") -> IntentAnalysis:
        """
        Analyze the user's query to understand their intent.
        Uses AI when available, falls back to pattern matching.
        """
        
        # If no AI available, use pattern-based detection
        if not self.model:
            logger.info("🔍 Using pattern-based intent detection")
            return self._detect_intent_pattern_based(query)
        
        prompt = f"""You are an expert at understanding user intent for social media content creation.

Analyze this user query and determine what they want:

USER QUERY:
\"\"\"
{query}
\"\"\"

TARGET PLATFORM: {platform}

POSSIBLE INTENTS:
1. "generate" - User wants AI to write a NEW post from scratch about a topic
   Examples: "Write a post about MCP", "Create a LinkedIn post about AI trends", "Post about my startup launch"

2. "enhance" - User has provided their OWN content and wants it IMPROVED
   Examples: Long paragraph of text without commands, "Here's my post, make it better: [content]"

3. "translate" - User wants to change the STYLE/TONE of content
   Examples: "Make this more professional", "Rewrite in casual tone", "Make it sound more confident"

4. "summarize" - User wants to CONDENSE longer content into a post
   Examples: "Turn this article into a post", "Summarize this for Twitter"

5. "expand" - User has a BRIEF idea and wants it ELABORATED
   Examples: "Expand on: AI is the future", "Make this longer", "Add more details to my idea"

DETECTION RULES:
- If user says "write/create/generate a post about [topic]" → GENERATE (they want new content)
- If user provides a substantial paragraph (30+ words) without explicit generate commands → ENHANCE (that's their content to improve)
- If user provides text that looks like a draft post with hashtags/emojis → ENHANCE
- Look for signal words: "improve", "enhance", "better" → ENHANCE
- Look for signal words: "write", "create", "generate", "make a post about" → GENERATE
- If text discusses a topic in detail (facts, explanations) without asking to generate → ENHANCE

RESPOND IN THIS EXACT JSON FORMAT:
{{
    "intent": "generate|enhance|translate|summarize|expand",
    "confidence": 0.0-1.0,
    "extracted_topic": "the main topic/subject",
    "user_content": "the user's own content if they provided any, otherwise null",
    "target_style": "the target style if translate intent, otherwise null",
    "additional_instructions": "any specific instructions the user gave"
}}

ONLY output the JSON, nothing else."""

        try:
            response = await self.model.generate_content_async(prompt)
            result_text = response.text.strip()
            
            # Clean up markdown code blocks if present
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            result = json.loads(result_text)
            logger.info(f"🧠 AI Intent Analysis: {result['intent']} (confidence: {result['confidence']})")
            
            return IntentAnalysis(
                intent=result.get("intent", UserIntent.GENERATE.value),
                confidence=result.get("confidence", 0.8),
                extracted_topic=result.get("extracted_topic", query),
                user_content=result.get("user_content"),
                target_style=result.get("target_style"),
                additional_instructions=result.get("additional_instructions")
            )
            
        except Exception as e:
            logger.warning(f"⚠️ AI intent analysis failed: {e}, using pattern matching")
            return self._detect_intent_pattern_based(query)


# ============================================================================
# SMART CONTENT GENERATOR
# ============================================================================

class SmartContentGenerator:
    """Generates content based on detected intent using specialized prompts."""
    
    def __init__(self):
        # Updated model list - using currently available Gemini models
        # IMPORTANT: Model names MUST include the "models/" prefix!
        self.models_to_try = [
            "models/gemini-2.0-flash",      # Latest and fastest
            "models/gemini-2.5-flash",      # Newest flash model
            "models/gemini-2.0-flash-001",  # Specific version fallback
            "models/gemini-2.5-pro",        # Higher quality, slower
        ]
    
    def _get_platform_guidelines(self, platform: str) -> str:
        """Get platform-specific content guidelines."""
        guidelines = {
            "discord": """Discord Post Guidelines:
- Use bold (**text**) for emphasis
- Add relevant emojis but don't overdo it  
- Keep it conversational and community-focused
- Encourage discussion and engagement
- Can use bullet points for clarity""",
            
            "x": """X/Twitter Guidelines:
- Max 280 characters preferred (can go up to 4000 for X Premium)
- Punchy, engaging opening hook
- Use line breaks for readability
- 2-3 relevant hashtags at the end
- Encourage retweets/replies
- Short, impactful sentences""",
            
            "linkedin": """LinkedIn Guidelines:
- Professional but personable tone
- Start with a hook that stops the scroll
- Use line breaks between paragraphs (very important!)
- Include 3-5 hashtags at the end
- End with a question or CTA
- Share insights and lessons learned
- 1300-2000 characters is ideal""",
            
            "instagram": """Instagram Guidelines:
- Eye-catching opening line (shown in preview)
- Use emojis strategically
- Break up text with line breaks
- 5-10 relevant hashtags (can put at end or in comments)
- Include a CTA
- Tell a story or share behind-the-scenes""",
            
            "facebook": """Facebook Guidelines:
- Conversational and relatable
- Tell a story if applicable
- Encourage comments and shares
- Can be longer form
- 1-3 hashtags maximum
- Personal tone works well""",
            
            "youtube": """YouTube Description Guidelines:
- Compelling title suggestion
- Key takeaways in first 2 lines (shown in preview)
- Timestamps if applicable
- CTA to subscribe
- Links section
- Include relevant keywords"""
        }
        return guidelines.get(platform, "")
    
    def _build_generate_prompt(self, topic: str, platform: str, mood: Optional[str], 
                                additional_instructions: Optional[str]) -> str:
        """Build prompt for generating new content from scratch."""
        return f"""You are an expert social media content creator for tech founders and entrepreneurs.

TASK: Create an engaging {platform} post about: "{topic}"

{self._get_platform_guidelines(platform)}

CONTENT REQUIREMENTS:
1. Sound like a real, passionate founder sharing insights - NOT like AI
2. Create genuine excitement and curiosity
3. Add context and value - don't just state facts
4. Include a hook that grabs attention immediately
5. {f'Mood/Tone: {mood}' if mood else 'Tone: Authentic, insightful, engaging'}
{f'6. Additional instructions: {additional_instructions}' if additional_instructions else ''}

AVOID:
- Generic phrases like "excited to announce" or "thrilled to share"
- AI clichés like "dive in", "game-changer", "revolutionary", "leverage", "synergy"
- Being too formal or corporate
- Starting with "I'm pleased to..." or "I'm excited to..."
- Overly salesy language

WRITING STYLE:
- Use personal experiences and observations when relevant
- Be specific rather than generic
- Show, don't just tell
- Use conversational language
- Add your unique perspective

NOW CREATE THE POST:
Generate only the final post content, ready to publish. No explanations or meta-commentary."""

    def _build_enhance_prompt(self, user_content: str, platform: str, mood: Optional[str],
                               additional_instructions: Optional[str]) -> str:
        """Build prompt for enhancing user-provided content."""
        return f"""You are an expert social media editor who enhances content while preserving the author's voice.

TASK: Improve this user's draft for {platform}

ORIGINAL CONTENT:
\"\"\"
{user_content}
\"\"\"

{self._get_platform_guidelines(platform)}

ENHANCEMENT GOALS:
1. PRESERVE the core message and the user's unique insights
2. Improve clarity, flow, and engagement
3. Make it more compelling for {platform}
4. Add appropriate formatting (line breaks, emojis where suitable)
5. Strengthen the hook/opening
6. Add a clear call-to-action if missing
7. {f'Target tone: {mood}' if mood else 'Maintain authentic tone'}
{f'8. Special request: {additional_instructions}' if additional_instructions else ''}

RULES:
- Keep the user's main points and insights intact
- Don't add information the user didn't mention
- Don't make it sound generic or AI-written
- Preserve technical accuracy
- Don't over-edit - subtle improvements are often best
- Add relevant hashtags for the platform

OUTPUT:
Generate only the enhanced post content, ready to publish. No explanations."""

    def _build_translate_prompt(self, user_content: str, target_style: str, platform: str,
                                  additional_instructions: Optional[str]) -> str:
        """Build prompt for translating content style."""
        return f"""You are an expert at adapting content tone and style while preserving meaning.

TASK: Transform this content to a {target_style} style for {platform}

ORIGINAL CONTENT:
\"\"\"
{user_content}
\"\"\"

TARGET STYLE: {target_style}
{self._get_platform_guidelines(platform)}

STYLE GUIDELINES:
- "professional" = polished, business-appropriate, credible
- "casual" = friendly, conversational, approachable  
- "bold" = confident, assertive, attention-grabbing
- "humorous" = witty, playful, entertaining
- "inspiring" = motivational, uplifting, empowering
- "educational" = informative, clear, structured

{f'Additional: {additional_instructions}' if additional_instructions else ''}

RULES:
- Keep all the original information and insights
- Only change the tone/style, not the substance
- Ensure it still sounds authentic, not AI-generated
- Add appropriate hashtags

OUTPUT:
Generate only the style-adapted post, ready to publish. No explanations."""

    def _build_summarize_prompt(self, user_content: str, platform: str, mood: Optional[str],
                                  additional_instructions: Optional[str]) -> str:
        """Build prompt for summarizing content into a post."""
        return f"""You are an expert at distilling complex content into engaging social media posts.

TASK: Summarize this content into a compelling {platform} post

ORIGINAL CONTENT:
\"\"\"
{user_content}
\"\"\"

{self._get_platform_guidelines(platform)}

SUMMARIZATION GOALS:
1. Extract the KEY insight or message
2. Make it engaging and shareable
3. Keep it concise but impactful
4. Add a hook that makes people want to learn more
5. {f'Tone: {mood}' if mood else 'Tone: Clear, engaging, valuable'}
{f'6. Special request: {additional_instructions}' if additional_instructions else ''}

RULES:
- Focus on the most important 1-2 points
- Don't try to include everything
- Make it feel complete, not like a teaser
- Add appropriate hashtags
- Include a CTA if relevant

OUTPUT:
Generate only the summarized post, ready to publish. No explanations."""

    def _build_expand_prompt(self, user_content: str, platform: str, mood: Optional[str],
                               additional_instructions: Optional[str]) -> str:
        """Build prompt for expanding brief ideas."""
        return f"""You are an expert at developing ideas into engaging, substantive social media content.

TASK: Expand this idea into a full {platform} post

USER'S IDEA:
\"\"\"
{user_content}
\"\"\"

{self._get_platform_guidelines(platform)}

EXPANSION GOALS:
1. Develop the core idea with supporting points
2. Add relevant examples or context
3. Make it valuable and substantive
4. Keep the user's original voice and perspective
5. Create an engaging narrative flow
6. {f'Tone: {mood}' if mood else 'Tone: Thoughtful, engaging, authentic'}
{f'7. Special request: {additional_instructions}' if additional_instructions else ''}

RULES:
- Stay true to the user's original idea
- Don't add unrelated tangents
- Make every sentence add value
- Add relevant hashtags
- Include a CTA or discussion prompt

OUTPUT:
Generate only the expanded post, ready to publish. No explanations."""

    async def generate(self, intent_analysis: IntentAnalysis, platform: str, 
                       mood: Optional[str] = None) -> str:
        """Generate content based on the analyzed intent."""
        
        intent = intent_analysis["intent"]
        topic = intent_analysis["extracted_topic"]
        user_content = intent_analysis.get("user_content")
        target_style = intent_analysis.get("target_style")
        additional_instructions = intent_analysis.get("additional_instructions")
        
        # Build the appropriate prompt based on intent
        if intent == UserIntent.GENERATE.value:
            prompt = self._build_generate_prompt(topic, platform, mood, additional_instructions)
        elif intent == UserIntent.ENHANCE.value:
            prompt = self._build_enhance_prompt(user_content or topic, platform, mood, additional_instructions)
        elif intent == UserIntent.TRANSLATE.value:
            prompt = self._build_translate_prompt(user_content or topic, target_style or "professional", 
                                                   platform, additional_instructions)
        elif intent == UserIntent.SUMMARIZE.value:
            prompt = self._build_summarize_prompt(user_content or topic, platform, mood, additional_instructions)
        elif intent == UserIntent.EXPAND.value:
            prompt = self._build_expand_prompt(user_content or topic, platform, mood, additional_instructions)
        else:
            # Default to generate
            prompt = self._build_generate_prompt(topic, platform, mood, additional_instructions)
        
        # Try to generate with AI
        api_key = os.getenv("GOOGLE_API_KEY", "")
        logger.info(f"🔑 API Key check: found={bool(api_key)}, length={len(api_key) if api_key else 0}")
        
        if not api_key:
            logger.warning("❌ No API key found in environment, using template")
            return None
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            logger.info("✅ Gemini SDK configured successfully")
        except Exception as e:
            logger.error(f"❌ Failed to configure Gemini SDK: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None
        
        # Try models in sequence
        last_error = None
        for model_name in self.models_to_try:
            try:
                logger.info(f"🚀 Attempting {model_name} for '{intent}' intent...")
                model = genai.GenerativeModel(model_name)
                
                logger.info(f"📤 Sending request to {model_name}...")
                response = await model.generate_content_async(prompt)
                
                # Check if response has text
                if not response or not hasattr(response, 'text'):
                    logger.warning(f"⚠️ {model_name} returned empty response")
                    continue
                
                content = response.text.strip()
                
                if not content:
                    logger.warning(f"⚠️ {model_name} returned empty text")
                    continue
                
                # Clean up markdown code blocks
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("\n"):
                        content = content[1:]
                    content = content.strip()
                
                logger.info(f"✅ SUCCESS! Generated {len(content)} chars with {model_name}")
                return content
                
            except Exception as e:
                last_error = str(e)
                logger.warning(f"⚠️ {model_name} failed: {e}")
                # Log full traceback for debugging
                import traceback
                logger.debug(traceback.format_exc())
                continue
        
        logger.error(f"❌ All models failed. Last error: {last_error}")
        return None


# ============================================================================
# SIMPLE CONTENT GENERATOR (Fallback)
# ============================================================================

def generate_content_simple(
    topic: str,
    platform: str,
    content_type: str = "post",
    mood: Optional[str] = None
) -> GeneratedContent:
    """Generate content using templates (no AI required)."""
    
    templates = TEMPLATES.get(platform, TEMPLATES["x"])
    template = random.choice(templates)
    
    # Fill in the template
    content = template.format(topic=topic)
    
    # Get hashtags
    hashtags = random.sample(
        HASHTAG_POOLS.get(platform, []), 
        min(3, len(HASHTAG_POOLS.get(platform, [])))
    )
    
    return GeneratedContent(
        id=f"post_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}",
        content=content,
        platform=platform,
        hashtags=hashtags,
        media_suggestions="Add a relevant image or video for better engagement",
        scheduled_time=None,
        authenticity_score=round(random.uniform(0.75, 0.95), 2),
        revision_count=0,
        intent_detected="template_fallback"
    )


# ============================================================================
# MARKETING AGENT CLASS - SMART VERSION
# ============================================================================

class MarketingAgent:
    """
    The FounderOS Smart Marketing Agent v2.0
    
    Intelligently understands user intent:
    - Generate new posts from scratch
    - Enhance user-provided content
    - Translate style/tone
    - Summarize content
    - Expand brief ideas
    
    Works with or without Gemini API key.
    Falls back to intelligent templates if AI is unavailable.
    """
    
    def __init__(self):
        self.intent_analyzer = IntentAnalyzer()
        self.content_generator = SmartContentGenerator()
        logger.info("🧠 Smart Marketing Agent v2.0 initialized")
        print("Marketing Agent initialized. Gemini API will be tried first.")
    
    async def generate_post(
        self,
        user_id: str,
        topic: str,
        platform: Literal["x", "instagram", "facebook", "linkedin", "youtube", "discord"],
        content_type: str = "post",
        mood: Optional[str] = None,
        call_to_action: Optional[str] = None
    ) -> GeneratedContent:
        """
        Generate a single post for a platform.
        
        Intelligently detects whether the user wants to:
        - Generate new content from a topic
        - Enhance their own provided content
        - Translate style, summarize, or expand
        """
        
        # Step 1: Analyze the user's intent
        logger.info(f"📝 Analyzing query: {topic[:100]}...")
        intent_analysis = await self.intent_analyzer.analyze(topic, platform)
        logger.info(f"🎯 Detected intent: {intent_analysis['intent']} (confidence: {intent_analysis['confidence']})")
        
        # Add CTA to the analysis if provided
        if call_to_action:
            if intent_analysis.get("additional_instructions"):
                intent_analysis["additional_instructions"] += f" Include CTA: {call_to_action}"
            else:
                intent_analysis["additional_instructions"] = f"Include CTA: {call_to_action}"
        
        # Step 2: Generate content based on intent
        content = await self.content_generator.generate(intent_analysis, platform, mood)
        
        # If AI generation failed, fall back to templates
        if not content:
            logger.warning("⚠️ AI generation failed, using template fallback")
            extracted_topic = intent_analysis.get("extracted_topic", topic)
            return generate_content_simple(extracted_topic, platform, content_type, mood)
        
        # Extract hashtags
        hashtags = [word for word in content.split() if word.startswith('#')]
        
        return GeneratedContent(
            id=f"post_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}",
            content=content,
            platform=platform,
            hashtags=hashtags,
            media_suggestions=self._suggest_media(intent_analysis["intent"], platform),
            scheduled_time=None,
            authenticity_score=0.92 + (intent_analysis["confidence"] * 0.05),
            revision_count=0,
            intent_detected=intent_analysis["intent"]
        )
    
    def _suggest_media(self, intent: str, platform: str) -> Optional[str]:
        """Suggest media based on intent and platform."""
        suggestions = {
            "generate": {
                "linkedin": "Consider adding an image that visualizes your key point",
                "x": "A relevant GIF or image can boost engagement by 150%",
                "instagram": "This needs a strong visual - photo, carousel, or Reel",
                "discord": "A meme or relevant screenshot could boost engagement",
                "youtube": "Thumbnail should be eye-catching with readable text",
                "facebook": "Native video or image carousel works best"
            },
            "enhance": {
                "linkedin": "Your content would pair well with a custom graphic",
                "x": "Consider a screenshot or infographic to illustrate your point",
                "instagram": "Consider creating a carousel from your key points",
                "discord": None,
                "youtube": None,
                "facebook": "A personal photo adds authenticity"
            }
        }
        
        intent_suggestions = suggestions.get(intent, suggestions.get("generate"))
        if intent_suggestions:
            return intent_suggestions.get(platform)
        return None
    
    async def batch_generate(
        self,
        user_id: str,
        requests: List[ContentRequest]
    ) -> List[GeneratedContent]:
        """Generate multiple posts at once."""
        results = []
        for req in requests:
            result = await self.generate_post(
                user_id=user_id,
                topic=req["topic"],
                platform=req["platform"],
                content_type=req.get("content_type", "post"),
                mood=req.get("mood"),
                call_to_action=req.get("call_to_action")
            )
            results.append(result)
        return results
    
    async def analyze_intent_only(self, query: str, platform: str = "linkedin") -> IntentAnalysis:
        """
        Public method to just analyze intent without generating content.
        Useful for debugging or UI feedback.
        """
        return await self.intent_analyzer.analyze(query, platform)


# Legacy function for backward compatibility
async def generate_content_ai(
    topic: str,
    platform: str,
    content_type: str = "post",
    mood: Optional[str] = None
) -> GeneratedContent:
    """Legacy function - now uses SmartMarketingAgent internally."""
    agent = MarketingAgent()
    return await agent.generate_post(
        user_id="legacy",
        topic=topic,
        platform=platform,
        content_type=content_type,
        mood=mood
    )


# Export the agent
marketing_agent = MarketingAgent()
