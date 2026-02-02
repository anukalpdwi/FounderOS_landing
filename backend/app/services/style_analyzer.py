"""
User Style Analyzer - The Brain Behind Authentic Content

This service extracts the "Writing DNA" from a user's past content,
enabling the Marketing Agent to generate posts that sound EXACTLY like them.
"""

from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
from pydantic import BaseModel

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))


class WritingDNA(BaseModel):
    """Complete profile of a user's writing style."""
    
    # Core Voice
    tone: str = "professional"  # casual, professional, witty, inspirational, edgy
    personality: str = "founder"  # founder, thought-leader, educator, entertainer
    formality: str = "moderate"  # very-casual, casual, moderate, formal, very-formal
    
    # Language Patterns
    vocabulary_level: str = "moderate"  # simple, moderate, advanced, technical
    avg_sentence_length: int = 15
    uses_contractions: bool = True
    uses_slang: bool = False
    
    # Visual Elements
    emoji_usage: str = "minimal"  # none, minimal, moderate, heavy
    favorite_emojis: List[str] = []
    hashtag_style: str = "minimal"  # none, minimal, trending, branded, heavy
    uses_line_breaks: bool = True
    
    # Content Patterns
    signature_phrases: List[str] = []
    topics: List[str] = []
    avoided_words: List[str] = ["synergy", "leverage", "dive in", "game-changer"]
    
    # Voice Examples
    best_posts: List[str] = []  # Examples of their best writing
    
    class Config:
        json_schema_extra = {
            "example": {
                "tone": "witty",
                "personality": "founder",
                "vocabulary_level": "moderate",
                "emoji_usage": "minimal",
                "favorite_emojis": ["🚀", "💡", "🔥"],
                "signature_phrases": ["Ship fast, learn faster", "Build in public"],
                "topics": ["startups", "AI", "product development"]
            }
        }


class OnboardingQuestion(BaseModel):
    """A question to ask during style onboarding."""
    id: str
    question: str
    type: str  # text, choice, multi-choice, scale
    options: Optional[List[str]] = None
    required: bool = True


# ============================================================================
# ONBOARDING QUESTIONS
# ============================================================================

ONBOARDING_QUESTIONS: List[OnboardingQuestion] = [
    OnboardingQuestion(
        id="brand_voice",
        question="How would you describe your brand voice?",
        type="choice",
        options=["Casual & Friendly", "Professional & Authoritative", "Witty & Playful", "Inspirational & Motivating", "Direct & No-nonsense"]
    ),
    OnboardingQuestion(
        id="target_audience",
        question="Who is your primary audience?",
        type="choice",
        options=["Startup Founders", "Tech Professionals", "General Consumers", "Enterprise Decision Makers", "Investors & VCs"]
    ),
    OnboardingQuestion(
        id="topics",
        question="What topics do you usually post about? (Select all that apply)",
        type="multi-choice",
        options=["Product Updates", "Industry Insights", "Personal Journey", "Tips & Tutorials", "Behind the Scenes", "Thought Leadership", "Team & Culture"]
    ),
    OnboardingQuestion(
        id="emoji_style",
        question="How do you feel about emojis?",
        type="choice",
        options=["Never use them", "Rarely, maybe 1-2", "A few to add personality", "Love them! 🚀🔥💡"]
    ),
    OnboardingQuestion(
        id="sample_posts",
        question="Paste 3-5 of your best past posts (one per line)",
        type="text",
        required=False
    ),
    OnboardingQuestion(
        id="avoid_words",
        question="Any words or phrases you NEVER want to use?",
        type="text",
        required=False
    )
]


class StyleAnalyzer:
    """
    Analyzes user content to extract their Writing DNA.
    
    The goal: Make AI-generated content indistinguishable from
    content the user would write themselves.
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def get_onboarding_questions(self) -> List[OnboardingQuestion]:
        """Get the list of onboarding questions."""
        return ONBOARDING_QUESTIONS
    
    async def analyze_from_onboarding(
        self,
        answers: Dict[str, Any]
    ) -> WritingDNA:
        """
        Create a WritingDNA profile from onboarding answers.
        """
        # Map answers to DNA
        voice_map = {
            "Casual & Friendly": ("casual", "moderate"),
            "Professional & Authoritative": ("professional", "formal"),
            "Witty & Playful": ("witty", "casual"),
            "Inspirational & Motivating": ("inspirational", "moderate"),
            "Direct & No-nonsense": ("direct", "moderate")
        }
        
        emoji_map = {
            "Never use them": ("none", []),
            "Rarely, maybe 1-2": ("minimal", ["🚀"]),
            "A few to add personality": ("moderate", ["🚀", "💡", "🔥", "✨"]),
            "Love them! 🚀🔥💡": ("heavy", ["🚀", "💡", "🔥", "✨", "💪", "🎯", "📈"])
        }
        
        # Extract voice and formality
        voice = answers.get("brand_voice", "Professional & Authoritative")
        tone, formality = voice_map.get(voice, ("professional", "moderate"))
        
        # Extract emoji preferences
        emoji_pref = answers.get("emoji_style", "Rarely, maybe 1-2")
        emoji_usage, favorite_emojis = emoji_map.get(emoji_pref, ("minimal", []))
        
        # Extract topics
        topics = answers.get("topics", ["Product Updates"])
        if isinstance(topics, str):
            topics = [topics]
        
        # Extract avoided words
        avoid_text = answers.get("avoid_words", "")
        avoided_words = [w.strip() for w in avoid_text.split(",") if w.strip()] if avoid_text else []
        avoided_words.extend(["synergy", "leverage", "dive in", "game-changer", "excited to announce"])
        
        # Extract sample posts
        samples = answers.get("sample_posts", "")
        best_posts = [p.strip() for p in samples.split("\n") if p.strip()] if samples else []
        
        # If we have sample posts, analyze them deeper
        signature_phrases = []
        if best_posts:
            signature_phrases = await self._extract_signature_phrases(best_posts)
        
        return WritingDNA(
            tone=tone,
            formality=formality,
            emoji_usage=emoji_usage,
            favorite_emojis=favorite_emojis,
            topics=topics,
            avoided_words=list(set(avoided_words)),
            best_posts=best_posts,
            signature_phrases=signature_phrases
        )
    
    async def analyze_from_posts(
        self,
        posts: List[str]
    ) -> WritingDNA:
        """
        Analyze a collection of posts to extract Writing DNA.
        This is the advanced method that learns from actual content.
        """
        if not posts:
            return WritingDNA()
        
        # Combine posts for analysis
        combined = "\n---\n".join(posts[:10])  # Limit to 10 posts
        
        prompt = f"""Analyze these social media posts from a founder and extract their writing style.

POSTS:
{combined}

Extract and return a JSON object with:
{{
    "tone": "casual|professional|witty|inspirational|direct",
    "formality": "very-casual|casual|moderate|formal",
    "vocabulary_level": "simple|moderate|advanced|technical",
    "avg_sentence_length": <number>,
    "uses_contractions": true|false,
    "emoji_usage": "none|minimal|moderate|heavy",
    "favorite_emojis": ["list", "of", "emojis"],
    "hashtag_style": "none|minimal|trending|branded|heavy",
    "uses_line_breaks": true|false,
    "signature_phrases": ["phrases", "they", "repeat"],
    "topics": ["main", "topics"],
    "personality": "founder|thought-leader|educator|entertainer"
}}

Be specific and accurate. Look for patterns."""

        try:
            response = await self.model.generate_content_async(prompt)
            # Parse JSON from response
            import json
            text = response.text
            
            # Find JSON in response
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                json_str = text[start:end]
                data = json.loads(json_str)
                return WritingDNA(**data)
        except Exception as e:
            print(f"Error analyzing posts: {e}")
        
        return WritingDNA(best_posts=posts)
    
    async def _extract_signature_phrases(
        self,
        posts: List[str]
    ) -> List[str]:
        """Extract recurring phrases from posts."""
        if not posts:
            return []
        
        combined = "\n".join(posts)
        
        prompt = f"""Find any signature phrases, catchphrases, or recurring expressions in these posts:

{combined}

Return a JSON array of 3-5 signature phrases. If none found, return empty array.
Example: ["Ship fast", "Build in public", "Let's go!"]"""

        try:
            response = await self.model.generate_content_async(prompt)
            import json
            text = response.text
            start = text.find('[')
            end = text.rfind(']') + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except:
            pass
        
        return []
    
    async def refine_from_feedback(
        self,
        current_dna: WritingDNA,
        approved_posts: List[str],
        rejected_posts: List[str]
    ) -> WritingDNA:
        """
        Refine the Writing DNA based on user feedback.
        Posts they approved → Learn from them
        Posts they rejected → Avoid that style
        """
        if not approved_posts and not rejected_posts:
            return current_dna
        
        prompt = f"""A user is training their AI writing assistant.

CURRENT STYLE PROFILE:
{current_dna.model_dump_json(indent=2)}

POSTS THEY APPROVED (match this style):
{chr(10).join(approved_posts) if approved_posts else "None"}

POSTS THEY REJECTED (avoid this style):
{chr(10).join(rejected_posts) if rejected_posts else "None"}

Based on their feedback, update the style profile. Return complete updated JSON."""

        try:
            response = await self.model.generate_content_async(prompt)
            import json
            text = response.text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                data = json.loads(text[start:end])
                return WritingDNA(**data)
        except Exception as e:
            print(f"Error refining DNA: {e}")
        
        return current_dna


# Export singleton
style_analyzer = StyleAnalyzer()
