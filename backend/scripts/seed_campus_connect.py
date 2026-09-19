"""
seed_campus_connect.py  --  second pass (idempotent)
Maps mentor expertise to existing DB categories.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timezone
from app.auth import hash_password
from app.database import SessionLocal
from app.models import (
    Account, AccountRole,
    ExpertiseCategory, ExpertiseVerificationStatus,
    LearningCircle, LearningCircleMember,
    MentorProfile, NetworkQuestion, QuestionMode,
    QuestionResponse, UserExpertise,
)

def _now():
    return datetime.now(timezone.utc)

# Map seed category keys to existing DB slugs
CATEGORY_MAP = {
    "ml-ai":                   "ai-ml",
    "fullstack-web":           "web-development",
    "cloud-devops":            "project-development",
    "mobile-dev":              "mobile-development",
    "competitive-programming": "competitive-programming",
    "product-design":          "ui-ux",
}

MENTORS = [
    {
        "account": {"email": "arjun.mehta@campus.edu", "password": "CampusConnect@2025", "role": AccountRole.STUDENT},
        "profile": {
            "display_name": "Arjun Mehta", "display_role": "Senior Student",
            "department": "Computer Science & Engineering", "year_or_batch": "4th Year, Batch 2025",
            "bio": "Final-year CSE undergrad with a strong background in machine learning and open-source contribution. I interned at a deep-tech startup working on transformer-based recommendation systems, and I love helping juniors break into ML without getting lost in math jargon.",
            "skills": ["Python", "PyTorch", "scikit-learn", "Hugging Face Transformers", "FastAPI", "SQL", "Git", "Linux"],
            "mentoring_topics": ["Getting started with ML", "Building your first neural network", "Interview prep for ML roles", "Contributing to open source"],
            "research_interests": ["NLP", "Recommendation Systems", "Efficient Inference"],
            "projects": [
                {"title": "SentimentAI", "description": "Fine-tuned DistilBERT on 500k e-commerce reviews achieving 93 percent F1. Deployed with FastAPI and Docker on Railway.", "link": "https://github.com/arjun-mehta/sentimentai"},
                {"title": "Quora Question-Pair Similarity", "description": "Siamese LSTM network for semantic textual similarity. Kaggle top 12 percent.", "link": "https://github.com/arjun-mehta/qqp-siamese"},
            ],
            "availability": "Weekday evenings (7-9 PM IST) and Sunday afternoons",
            "github_url": "https://github.com/arjun-mehta", "linkedin_url": "https://linkedin.com/in/arjun-mehta-cse",
        },
        "expertise_tags": ["PyTorch", "NLP", "scikit-learn", "Hugging Face"],
        "category_slug": "ml-ai",
    },
    {
        "account": {"email": "priya.nair@campus.edu", "password": "CampusConnect@2025", "role": AccountRole.TEACHER},
        "profile": {
            "display_name": "Dr. Priya Nair", "display_role": "Faculty",
            "department": "Information Technology", "year_or_batch": "Associate Professor",
            "bio": "Associate Professor with 11 years of experience in distributed systems and cloud-native architecture. Published 24 papers in IEEE and ACM journals. I run the Cloud and DevOps lab on campus and mentor final-year project teams on containerisation and Kubernetes.",
            "skills": ["Kubernetes", "Docker", "AWS", "GCP", "Terraform", "Go", "Python", "Distributed Systems"],
            "mentoring_topics": ["Cloud architecture design", "Containers and orchestration", "Research paper writing", "Final-year project guidance"],
            "research_interests": ["Edge Computing", "Serverless Architectures", "Fault-tolerant Distributed Systems"],
            "projects": [
                {"title": "EdgeSync", "description": "Open-source Go framework for bidirectional sync between edge nodes and cloud. Used in 3 campus IoT projects and cited in 6 external papers.", "link": "https://github.com/priya-nair-it/edgesync"},
                {"title": "K8s Cost Analyser", "description": "Prometheus-based tool for per-namespace cost estimates inside Kubernetes clusters. Presented at KubeCon 2024.", "link": "https://github.com/priya-nair-it/k8s-cost-analyser"},
            ],
            "availability": "Tuesday and Thursday 3-5 PM (Office Hours). By appointment otherwise.",
            "github_url": "https://github.com/priya-nair-it", "linkedin_url": "https://linkedin.com/in/dr-priya-nair",
            "portfolio_url": "https://priya-nair.campus.edu",
        },
        "expertise_tags": ["Kubernetes", "Docker", "AWS", "Terraform", "Distributed Systems"],
        "category_slug": "cloud-devops",
    },
    {
        "account": {"email": "rohan.verma@alumni.campus.edu", "password": "CampusConnect@2025", "role": AccountRole.STUDENT},
        "profile": {
            "display_name": "Rohan Verma", "display_role": "Alumnus",
            "department": "Computer Science & Engineering", "year_or_batch": "Alumnus, Batch 2022",
            "bio": "SDE-2 at Razorpay working on the Payments Core team. Graduated in 2022 and have been building high-throughput financial APIs ever since. Passionate about systems design, clean code, and helping students crack FAANG or fintech interviews.",
            "skills": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Redis", "Kafka", "System Design", "Java"],
            "mentoring_topics": ["Full-stack project architecture", "System design interviews", "Building side projects that get you hired", "Internship and placement prep"],
            "research_interests": ["High-throughput APIs", "Event-driven architecture"],
            "projects": [
                {"title": "DevConnect", "description": "LinkedIn-style developer networking platform with GitHub OAuth, project showcasing, skills endorsement, and real-time chat via Socket.io. Around 3000 active users at peak.", "link": "https://github.com/rohan-verma/devconnect"},
                {"title": "Budget Buddy", "description": "Next.js plus Prisma plus PostgreSQL personal finance tracker with ML spend-category tagging. Featured on Product Hunt front page.", "link": "https://github.com/rohan-verma/budget-buddy"},
            ],
            "availability": "Saturday mornings 10 AM to 12 PM IST. Async on weekdays.",
            "github_url": "https://github.com/rohan-verma", "linkedin_url": "https://linkedin.com/in/rohan-verma-sde",
        },
        "expertise_tags": ["React", "Next.js", "TypeScript", "System Design", "PostgreSQL"],
        "category_slug": "fullstack-web",
    },
    {
        "account": {"email": "sneha.rao@campus.edu", "password": "CampusConnect@2025", "role": AccountRole.STUDENT},
        "profile": {
            "display_name": "Sneha Rao", "display_role": "Senior Student",
            "department": "Electronics & Computer Science", "year_or_batch": "3rd Year, Batch 2026",
            "bio": "3rd-year ECS student with a passion for mobile apps. Published 2 apps on Play Store with 10k+ downloads combined. Active Flutter community contributor and GDSC lead on campus.",
            "skills": ["Flutter", "Dart", "Android (Kotlin)", "Firebase", "REST APIs", "Bloc", "Riverpod", "Figma"],
            "mentoring_topics": ["Getting started with Flutter", "State management patterns Bloc vs Riverpod", "Publishing to Play Store", "GDSC project collaboration"],
            "research_interests": ["Offline-first mobile apps", "Accessibility in mobile UX"],
            "projects": [
                {"title": "CampusEats", "description": "Flutter app for pre-ordering canteen meals with queue tracking and digital payments. 4.6 stars on Play Store, deployed at 3 campuses.", "link": "https://github.com/sneha-rao/campuseats"},
                {"title": "StudySync", "description": "Spaced-repetition flashcard app with offline-first SQLite storage and background sync. 12k downloads, featured by Flutter Community.", "link": "https://github.com/sneha-rao/studysync"},
            ],
            "availability": "Weekday evenings and weekends",
            "github_url": "https://github.com/sneha-rao", "linkedin_url": "https://linkedin.com/in/sneha-rao-flutter",
        },
        "expertise_tags": ["Flutter", "Dart", "Firebase", "Android", "Bloc"],
        "category_slug": "mobile-dev",
    },
    {
        "account": {"email": "karthik.sub@campus.edu", "password": "CampusConnect@2025", "role": AccountRole.STUDENT},
        "profile": {
            "display_name": "Karthik Subramaniam", "display_role": "Senior Student",
            "department": "Mathematics & Computing", "year_or_batch": "4th Year, Batch 2025",
            "bio": "ICPC Asia Regional contestant in 2023 and 2024. Codeforces Candidate Master with 2150 peak rating. 4 years of competitive programming. I love teaching problem-solving from DSA foundations all the way to advanced graph theory and DP optimisation.",
            "skills": ["C++", "Python", "Data Structures", "Graph Algorithms", "Dynamic Programming", "Segment Trees", "Number Theory"],
            "mentoring_topics": ["CP for absolute beginners", "DSA interview prep FAANG-style", "Advanced DP and graphs", "ICPC team strategy"],
            "research_interests": ["Combinatorial optimisation", "Approximation algorithms"],
            "projects": [
                {"title": "AlgoViz", "description": "Interactive step-by-step visualiser for 40+ classic algorithms including sorting, graph traversal, and DP table fills. Built with React and D3.js.", "link": "https://github.com/karthik-sub/algoviz"},
                {"title": "CP-Templates", "description": "Contest-ready C++ template library covering Fenwick trees, Lazy Segment trees, Miller-Rabin, and more. Over 400 GitHub stars.", "link": "https://github.com/karthik-sub/cp-templates"},
            ],
            "availability": "Mon Wed Fri evenings. Sunday sessions via Zoom.",
            "github_url": "https://github.com/karthik-sub", "linkedin_url": "https://linkedin.com/in/karthik-subramaniam-cp",
        },
        "expertise_tags": ["C++", "Dynamic Programming", "Graph Algorithms", "Data Structures"],
        "category_slug": "competitive-programming",
    },
    {
        "account": {"email": "aisha.bano@campus.edu", "password": "CampusConnect@2025", "role": AccountRole.STUDENT},
        "profile": {
            "display_name": "Aisha Bano", "display_role": "Peer Mentor",
            "department": "Human-Computer Interaction", "year_or_batch": "3rd Year, Batch 2026",
            "bio": "UX designer and product thinker. Interned at two design-led startups and led UX for our SIH 2024 winning team. I help developers learn the design side: user research, wireframing, prototyping, and turning ideas into products people actually love.",
            "skills": ["Figma", "Adobe XD", "User Research", "Prototyping", "Usability Testing", "Design Systems", "HTML/CSS", "Product Management"],
            "mentoring_topics": ["UX fundamentals for developers", "Building a design portfolio", "Figma from zero to prototype", "Hackathon product strategy"],
            "research_interests": ["Inclusive design", "Emotion-driven UI", "AR and VR interfaces"],
            "projects": [
                {"title": "Sahayak", "description": "SIH 2024 winning app. Multilingual health advisory for rural India designed from 80+ village-level interviews with ASHA worker-optimised UX.", "link": "https://www.figma.com/community/file/sahayak-case-study"},
                {"title": "OpenDesign Campus", "description": "Free Figma templates, icon packs, and UX checklists for student designers. Over 2000 resource downloads.", "link": "https://github.com/aisha-bano/opendesign-campus"},
            ],
            "availability": "Tuesday and Thursday evenings. DMs always open.",
            "github_url": "https://github.com/aisha-bano", "linkedin_url": "https://linkedin.com/in/aisha-bano-ux",
            "portfolio_url": "https://aisha-bano.design",
        },
        "expertise_tags": ["Figma", "UX Research", "Prototyping", "Design Systems"],
        "category_slug": "product-design",
    },
]

QUESTIONS = [
    {
        "title": "How do I fine-tune a pre-trained BERT model on my own dataset?",
        "body": "I have a dataset of 20k customer support tickets and want to classify them into 8 categories. I have read about fine-tuning BERT but am confused about data preparation steps, especially tokenisation and handling class imbalance. What is the recommended pipeline?",
        "concept_tag": "NLP",
        "mode": QuestionMode.PUBLIC,
        "asker_email": "sneha.rao@campus.edu",
        "answer": {"body": "Great question! Here is the pipeline I recommend:\n1. Tokenise with AutoTokenizer using truncation=True and max_length=256.\n2. Handle class imbalance with WeightedRandomSampler or class weights in CrossEntropyLoss.\n3. Use the Trainer API which handles LR scheduling, gradient accumulation, and eval loops.\n4. Start with a learning rate of 2e-5 to 3e-5 for BERT fine-tuning.\nHappy to share a working Colab notebook if you want!", "answerer_email": "arjun.mehta@campus.edu"},
    },
    {
        "title": "Kubernetes vs Docker Compose for a 5-service college project on a single VM?",
        "body": "We are building a microservices project with 5 services for our final year. Should we use Docker Compose or Kubernetes? The project runs on a single VM on Google Cloud. Worried Kubernetes might be overkill but my team wants to add it to the resume.",
        "concept_tag": "Kubernetes",
        "mode": QuestionMode.PUBLIC,
        "asker_email": "karthik.sub@campus.edu",
        "answer": {"body": "For a single-VM final-year project, Docker Compose is the right call. It is simpler to set up, debug, and explain in your viva.\n\nFor resume value, deploy on Cloud Run (GCP) or App Platform (DigitalOcean): managed container orchestration without K8s overhead and it looks great on a CV.\n\nIf you do want a taste of K8s, use K3s on the VM. It installs in 30 seconds and is production-grade enough for demos.", "answerer_email": "priya.nair@campus.edu"},
    },
    {
        "title": "Which state management approach should I use in Flutter for a food ordering app?",
        "body": "Building a food ordering app in Flutter at Swiggy-scale for our college. It has auth, cart, real-time order tracking, and a profile screen. Started with setState() but it is getting messy. Should I use Bloc, Riverpod, or Provider?",
        "concept_tag": "Flutter",
        "mode": QuestionMode.PUBLIC,
        "asker_email": "karthik.sub@campus.edu",
        "answer": {"body": "For a food ordering app of that complexity, I strongly recommend Riverpod v2. Provider is great for simple apps but gets verbose with async state. Bloc is powerful but has lots of boilerplate. Riverpod hits the sweet spot: compile-safe, testable, and handles async streams perfectly for real-time order tracking with Firebase Firestore.\n\nI built CampusEats with Riverpod and am happy to pair-programme on the cart logic with you!", "answerer_email": "sneha.rao@campus.edu"},
    },
]

CIRCLES = [
    {
        "title": "ML Paper Reading Club",
        "description": "Weekly sessions where we read, present, and discuss recent ML papers from NeurIPS, ICML, and ICLR. No PhD required, just curiosity!",
        "concept_tag": "Machine Learning",
        "category_slug": "ml-ai",
        "creator_email": "arjun.mehta@campus.edu",
        "member_emails": ["sneha.rao@campus.edu", "karthik.sub@campus.edu"],
    },
    {
        "title": "Full-Stack Project Builders",
        "description": "Build and ship a full-stack side project in 8 weeks. Each week includes a demo, code review, and one actionable improvement. Beginners welcome, seniors mentor.",
        "concept_tag": "Full-Stack",
        "category_slug": "fullstack-web",
        "creator_email": "rohan.verma@alumni.campus.edu",
        "member_emails": ["aisha.bano@campus.edu", "arjun.mehta@campus.edu"],
    },
    {
        "title": "Competitive Programming Bootcamp",
        "description": "Structured 12-week bootcamp from arrays to advanced DP. Two problem sets per week with editorial walkthroughs. Aimed at ICPC aspirants and placement prep.",
        "concept_tag": "Competitive Programming",
        "category_slug": "competitive-programming",
        "creator_email": "karthik.sub@campus.edu",
        "member_emails": ["sneha.rao@campus.edu"],
    },
]


def seed():
    db = SessionLocal()
    try:
        print("Starting Campus Connect seed...\n")

        # 1. Build category map from existing DB
        cat_map = {}
        for seed_slug, db_slug in CATEGORY_MAP.items():
            cat = db.query(ExpertiseCategory).filter_by(slug=db_slug).first()
            if cat:
                cat_map[seed_slug] = cat.id
                print(f"  [MAP]  Category {seed_slug!r} -> {db_slug!r} (id={cat.id[:8]})")
            else:
                print(f"  [WARN] Category not found in DB: {db_slug}")

        admin_account = db.query(Account).filter_by(role=AccountRole.ADMIN).first()
        admin_id = admin_account.id if admin_account else None

        # 2. Accounts + Profiles + Expertise
        account_map = {}
        mentor_map = {}

        for m in MENTORS:
            email = m["account"]["email"]
            acct = db.query(Account).filter_by(email=email).first()
            if not acct:
                acct = Account(
                    email=email,
                    password_hash=hash_password(m["account"]["password"]),
                    role=m["account"]["role"],
                )
                db.add(acct)
                db.flush()
                print(f"  [OK]   Account: {email}")
            else:
                print(f"  [SKIP] Account: {email}")
            account_map[email] = acct.id

            prof = db.query(MentorProfile).filter_by(account_id=acct.id).first()
            if not prof:
                prof = MentorProfile(account_id=acct.id, **m["profile"])
                db.add(prof)
                db.flush()
                print(f"  [OK]   Profile: {m['profile']['display_name']}")
            else:
                print(f"  [SKIP] Profile: {m['profile']['display_name']}")
            mentor_map[email] = prof.id

            cat_id = cat_map.get(m["category_slug"])
            for tag in m["expertise_tags"]:
                exists = db.query(UserExpertise).filter_by(mentor_id=prof.id, concept_tag=tag).first()
                if not exists:
                    exp = UserExpertise(
                        mentor_id=prof.id,
                        category_id=cat_id,
                        concept_tag=tag,
                        status=ExpertiseVerificationStatus.VERIFIED,
                        verified_by_account_id=admin_id,
                        verified_at=_now(),
                        review_notes="Auto-verified by seed script.",
                    )
                    db.add(exp)
                    print(f"       Tag verified: {tag}")

        db.flush()

        # 3. Sample Q&A
        for q_data in QUESTIONS:
            asker_id = account_map.get(q_data["asker_email"])
            if not asker_id:
                continue
            existing_q = db.query(NetworkQuestion).filter_by(title=q_data["title"]).first()
            if not existing_q:
                question = NetworkQuestion(
                    author_account_id=asker_id,
                    concept_tag=q_data.get("concept_tag"),
                    title=q_data["title"],
                    body=q_data["body"],
                    mode=q_data.get("mode", QuestionMode.PUBLIC),
                )
                db.add(question)
                db.flush()
                print(f"  [OK]   Q: {q_data['title'][:65]}")
                ans = q_data.get("answer")
                if ans:
                    answerer_id = account_map.get(ans["answerer_email"])
                    if answerer_id:
                        db.add(QuestionResponse(
                            question_id=question.id,
                            responder_account_id=answerer_id,
                            body=ans["body"],
                            is_accepted_solution=True,
                        ))
                        print(f"       Answer by: {ans['answerer_email']}")
            else:
                print(f"  [SKIP] Q: {q_data['title'][:65]}")

        db.flush()

        # 4. Learning circles
        for circle_data in CIRCLES:
            creator_id = account_map.get(circle_data["creator_email"])
            if not creator_id:
                continue
            cat_id = cat_map.get(circle_data["category_slug"])
            existing_c = db.query(LearningCircle).filter_by(title=circle_data["title"]).first()
            if not existing_c:
                circle = LearningCircle(
                    creator_account_id=creator_id,
                    title=circle_data["title"],
                    description=circle_data["description"],
                    concept_tag=circle_data.get("concept_tag"),
                    category_id=cat_id,
                )
                db.add(circle)
                db.flush()
                db.add(LearningCircleMember(circle_id=circle.id, account_id=creator_id, role="lead"))
                for mem_email in circle_data.get("member_emails", []):
                    mem_id = account_map.get(mem_email)
                    if mem_id:
                        db.add(LearningCircleMember(circle_id=circle.id, account_id=mem_id, role="member"))
                print(f"  [OK]   Circle: {circle_data['title']}")
            else:
                print(f"  [SKIP] Circle: {circle_data['title']}")

        db.commit()
        print("\nSeed completed successfully!")
        print("\nMentor accounts (password: CampusConnect@2025):")
        for m in MENTORS:
            print(f"  {m['account']['email']:48s} [{m['account']['role'].value:7s}]  {m['profile']['display_name']}")

    except Exception as exc:
        db.rollback()
        print(f"\nSeed FAILED: {exc}")
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
