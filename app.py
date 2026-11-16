import streamlit as st
import pandas as pd
import json
import os
from datetime import datetime, timedelta
import urllib.parse

# -----------------------------------------------------------------------------
# 1. STREAMLIT CONFIGURATION & CUSTOM STYLING (Karnataka Terracotta & Amber Theme)
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="UtsavLocal — Bengaluru Event & Festival Aggregator",
    page_icon="🪔",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for Cultural Bengaluru Palette & Modern Cards
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Top Banner / Hero Styling */
    .hero-banner {
        background: linear-gradient(135deg, #9A3412 0%, #EA580C 50%, #D97706 100%);
        border-radius: 20px;
        padding: 36px 30px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.25);
    }
    
    .hero-title {
        font-size: 2.3rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin-bottom: 8px;
        line-height: 1.2;
    }
    
    .hero-subtitle {
        font-size: 1.05rem;
        font-weight: 400;
        opacity: 0.95;
        max-width: 720px;
        line-height: 1.5;
    }
    
    /* Badges */
    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-right: 6px;
    }
    
    .badge-terracotta { background-color: #FFEDD5; color: #9A3412; border: 1px solid #FDBA74; }
    .badge-amber { background-color: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }
    .badge-indigo { background-color: #E0E7FF; color: #3730A3; border: 1px solid #A5B4FC; }
    .badge-emerald { background-color: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7; }
    .badge-rose { background-color: #FFE4E6; color: #9F1239; border: 1px solid #FDA4AF; }
    .badge-sky { background-color: #E0F2FE; color: #075985; border: 1px solid #7DD3FC; }
    .badge-free { background-color: #DCFCE7; color: #166534; font-weight: 800; }
    .badge-price { background-color: #F1F5F9; color: #334155; font-weight: 800; }
    
    /* Status Badges */
    .status-approved { background-color: #DCFCE7; color: #15803D; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
    .status-pending { background-color: #FEF3C7; color: #B45309; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
    .status-rejected { background-color: #FEE2E2; color: #B91C1C; font-weight: 700; padding: 3px 8px; border-radius: 6px; }

    /* Custom Event Card Container */
    .event-card-box {
        background-color: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 16px;
        padding: 18px;
        margin-bottom: 20px;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }
    .event-card-box:hover {
        border-color: #FB923C;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
    }
    
    /* Metric summary box */
    .metric-card {
        background-color: white;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #E2E8F0;
        text-align: center;
        box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
    }
    .metric-value {
        font-size: 1.8rem;
        font-weight: 800;
        color: #EA580C;
    }
    .metric-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 2. PERSISTENCE & DATA ENGINE (JSON / MongoDB / Session State)
# -----------------------------------------------------------------------------
DATA_FILE = "utsavlocal_data.json"

CATEGORY_BADGES = {
    "Cultural Festival": "badge-terracotta",
    "Workshop": "badge-amber",
    "Music & Arts": "badge-indigo",
    "Food & Bazaar": "badge-rose",
    "Community Drive": "badge-emerald",
    "Sports": "badge-sky",
}

DEMO_USERS = {
    "admin": {
        "email": "admin@utsavlocal.in",
        "name": "Pooja Hegde (Admin)",
        "role": "admin",
        "saved_events": [],
        "rsvped_events": [],
    },
    "organizer": {
        "email": "organizer@utsavlocal.in",
        "name": "Ramesh Gowda (Namma Cultural Trust)",
        "role": "organizer",
        "saved_events": [],
        "rsvped_events": [],
    },
    "citizen": {
        "email": "user@utsavlocal.in",
        "name": "Ananya Rao (Local Citizen)",
        "role": "user",
        "saved_events": ["1", "2"],
        "rsvped_events": ["1"],
    },
}

def get_initial_events():
    today = datetime.now()
    
    # Calculate nearest upcoming weekend
    day_of_week = today.weekday() # Monday is 0, Sunday is 6
    days_to_sat = (5 - day_of_week) % 7
    sat_date = today + timedelta(days=days_to_sat)
    sun_date = sat_date + timedelta(days=1)
    
    return [
        {
            "id": "1",
            "title": "Kadalekayi Parishe Heritage Walk & Groundnut Fair",
            "description": "Experience the 500-year-old historic groundnut fair at Bull Temple. Walk through centuries-old banyan lanes, taste roasted and spiced groundnuts from local farmers of Karnataka & Tamil Nadu, and witness traditional folk music performances like Dollu Kunitha.",
            "category": "Cultural Festival",
            "date": sat_date.strftime("%Y-%m-%d"),
            "startTime": "07:30 AM",
            "endTime": "11:30 AM",
            "venueName": "Dodda Ganesha & Bull Temple Road",
            "address": "Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560004",
            "neighborhood": "Basavanagudi",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "approved",
            "attendeesCount": 142,
            "bannerImage": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "2",
            "title": "Malleshwaram Classical Veena Evening & Carnatic Recital",
            "description": "An intimate open-air twilight Carnatic classical concert featuring veteran Veena exponents accompanied by Mridangam and Ghatam. Enjoy the timeless acoustics of the traditional Malleshwaram temple courtyard as fragrance of jasmine and filter coffee fills the evening air.",
            "category": "Music & Arts",
            "date": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
            "startTime": "05:30 PM",
            "endTime": "08:30 PM",
            "venueName": "Seetha Rama Bhavana Heritage Courtyard",
            "address": "8th Cross, Margosa Road, Malleshwaram, Bengaluru 560003",
            "neighborhood": "Malleshwaram",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "approved",
            "attendeesCount": 88,
            "bannerImage": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "3",
            "title": "Indiranagar Zero-Waste Pottery & Terracotta Workshop",
            "description": "Learn traditional hand-building terracotta pottery techniques from artisan potters of Pottery Town. Create your own diyas, kulhads, and eco-friendly plant pots while discovering sustainable clay sourcing and natural glazing methods.",
            "category": "Workshop",
            "date": sun_date.strftime("%Y-%m-%d"),
            "startTime": "10:30 AM",
            "endTime": "01:30 PM",
            "venueName": "Courtyard Kula Creative Center",
            "address": "12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
            "neighborhood": "Indiranagar",
            "isFree": False,
            "ticketPrice": 450,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "approved",
            "attendeesCount": 35,
            "bannerImage": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "4",
            "title": "Cubbon Park Sunday Book Swap & Community Art Bazaar",
            "description": "Bring your pre-loved books and exchange them under the majestic bamboo groves of Cubbon Park. Features live watercolor sketching sessions, indie zine pop-ups, children storytelling circles, and handmade craft stalls by local Bengaluru artists.",
            "category": "Food & Bazaar",
            "date": sun_date.strftime("%Y-%m-%d"),
            "startTime": "08:00 AM",
            "endTime": "01:00 PM",
            "venueName": "Bandstand Lawn, Cubbon Park",
            "address": "Kasturba Road, Sampangi Rama Nagar, Bengaluru 560001",
            "neighborhood": "Sampangi Rama Nagar",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "admin@utsavlocal.in",
            "organizerName": "Pooja Hegde (Community Admin)",
            "status": "approved",
            "attendeesCount": 110,
            "bannerImage": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "5",
            "title": "Sankey Tank Community Lake Cleanup & Birdwatching Walk",
            "description": "Join neighborhood volunteers and urban ecologists for a morning lake restoration and shoreline de-weeding initiative. Followed by a guided wetland bird census spotting Spot-billed Pelicans, Little Grebes, and Purple Herons.",
            "category": "Community Drive",
            "date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "startTime": "06:30 AM",
            "endTime": "09:30 AM",
            "venueName": "Sankey Tank Forest Gate",
            "address": "11th Cross, Sadashivanagar / Malleshwaram, Bengaluru 560080",
            "neighborhood": "Sadashivanagar",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "approved",
            "attendeesCount": 64,
            "bannerImage": "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "6",
            "title": "Jayanagar Street Food Carnival & Filter Coffee Fest",
            "description": "Celebrate the beloved culinary heritage of South Bengaluru! Savor authentic Davangere benne dosas, crispy paddu, piping hot mangalore bajjis, holige, and freshly brewed Mysore filter coffee served in traditional brass dabara-tumblers.",
            "category": "Food & Bazaar",
            "date": (today + timedelta(days=6)).strftime("%Y-%m-%d"),
            "startTime": "04:00 PM",
            "endTime": "10:00 PM",
            "venueName": "Jayanagar 4th Block Complex Promenade",
            "address": "9th Main Road, 4th Block, Jayanagar, Bengaluru 560011",
            "neighborhood": "Jayanagar",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "approved",
            "attendeesCount": 220,
            "bannerImage": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "7",
            "title": "Koramangala Acoustic Indie Sundowner & Open Mic Night",
            "description": "An intimate rooftop gathering for homegrown singer-songwriters, poets, and acoustic instrumentalists. Featuring performances in Kannada, Hindi, and English with community drum circles and artisan chai corners.",
            "category": "Music & Arts",
            "date": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
            "startTime": "06:00 PM",
            "endTime": "09:30 PM",
            "venueName": "The Terra Rooftop Community Amphitheatre",
            "address": "80 Feet Road, 6th Block, Koramangala, Bengaluru 560095",
            "neighborhood": "Koramangala",
            "isFree": False,
            "ticketPrice": 200,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "approved",
            "attendeesCount": 75,
            "bannerImage": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "8",
            "title": "Hebbal Sunrise 5K Heritage Run & Community Yoga Session",
            "description": "Kickstart your fitness weekend with a scenic 5K community run along the scenic Hebbal lake promenade, followed by 45 minutes of Pranayama and Hatha Yoga led by certified yogis under the morning sun.",
            "category": "Sports",
            "date": sat_date.strftime("%Y-%m-%d"),
            "startTime": "06:00 AM",
            "endTime": "08:30 AM",
            "venueName": "Hebbal Lake Park Pavilion",
            "address": "Bellary Road, Hebbal Flyover Junction, Bengaluru 560024",
            "neighborhood": "Hebbal",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "approved",
            "attendeesCount": 92,
            "bannerImage": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
        },
        # Pending Submissions for Admin Queue
        {
            "id": "9",
            "title": "Bengaluru Karaga Shaktyotsava Midnight Photography Walk",
            "description": "Documentary photo-walk exploring the historic Pete (old city) alleys during the Karaga preparations. Observe the vibrant floral decoration rituals, sword-bearing Veerakumaras, and historic dargah-temple interfaith traditions.",
            "category": "Cultural Festival",
            "date": (today + timedelta(days=8)).strftime("%Y-%m-%d"),
            "startTime": "10:00 PM",
            "endTime": "02:00 AM",
            "venueName": "Dharmaraya Swamy Temple Square",
            "address": "OTC Road, Tigalarpet, Nagarathpet, Bengaluru 560002",
            "neighborhood": "Tigalarpet",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "pending",
            "attendeesCount": 0,
            "bannerImage": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": "10",
            "title": "Basavanagudi Native Tree Planting & Seedball Workshop",
            "description": "Help restore Bengaluru’s garden city canopy! We will make 1,000 seedballs using indigenous species (Neem, Honge, Tamarind) and plant 50 native shade saplings along neighborhood public avenues and school grounds.",
            "category": "Community Drive",
            "date": (today + timedelta(days=9)).strftime("%Y-%m-%d"),
            "startTime": "08:00 AM",
            "endTime": "11:00 AM",
            "venueName": "Bugle Rock Eco Park",
            "address": "Bull Temple Road, Basavanagudi, Bengaluru 560019",
            "neighborhood": "Basavanagudi",
            "isFree": True,
            "ticketPrice": 0,
            "organizerEmail": "organizer@utsavlocal.in",
            "organizerName": "Ramesh Gowda (Namma Bengaluru Cultural Trust)",
            "status": "pending",
            "attendeesCount": 0,
            "bannerImage": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        },
    ]

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("events", []), data.get("users", DEMO_USERS)
        except Exception:
            pass
    events = get_initial_events()
    users = DEMO_USERS
    save_data(events, users)
    return events, users

def save_data(events, users):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump({"events": events, "users": users}, f, indent=2, ensure_ascii=False)
    except Exception as e:
        st.error(f"Error saving data: {e}")

# Initialize Session State
if "events" not in st.session_state or "users" not in st.session_state:
    events, users = load_data()
    st.session_state.events = events
    st.session_state.users = users

if "current_user_key" not in st.session_state:
    st.session_state.current_user_key = "citizen"

current_user = st.session_state.users.get(st.session_state.current_user_key, DEMO_USERS["citizen"])

# -----------------------------------------------------------------------------
# 3. SIDEBAR CONTROLS & PERSONA SWITCHER
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="background: linear-gradient(135deg, #EA580C, #D97706); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            🪔
        </div>
        <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #0F172A; line-height: 1.1;">Utsav<span style="color: #EA580C;">Local</span></div>
            <div style="font-size: 0.7rem; font-weight: 700; color: #10B981; letter-spacing: 0.05em; text-transform: uppercase;">● Namma Bengaluru</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.divider()
    
    st.markdown("**⚡ 1-Click Persona Switcher**")
    persona_options = {
        "citizen": "🙋‍♂️ Local Citizen (Ananya)",
        "organizer": "🎪 Event Organizer (Ramesh)",
        "admin": "🛡️ Community Admin (Pooja)",
        "guest": "👤 Guest (Read-Only)",
    }
    
    selected_persona = st.selectbox(
        "Active Role:",
        options=list(persona_options.keys()),
        format_func=lambda x: persona_options[x],
        index=list(persona_options.keys()).index(st.session_state.current_user_key)
        if st.session_state.current_user_key in persona_options else 0,
        key="persona_select",
    )
    
    if selected_persona != st.session_state.current_user_key:
        st.session_state.current_user_key = selected_persona
        st.rerun()

    current_role = current_user.get("role", "guest") if selected_persona != "guest" else "guest"
    
    st.info(f"**Logged in as:** `{current_user.get('name', 'Guest')}`\n\n**Email:** `{current_user.get('email', 'guest@utsavlocal.in')}`\n\n**Role:** `{current_role.upper()}`")
    
    pending_count = sum(1 for e in st.session_state.events if e.get("status") == "pending")
    if current_role == "admin" and pending_count > 0:
        st.warning(f"⚠️ **{pending_count} Pending Submissions** await your review in the Admin Panel!")
        
    st.divider()
    
    # Navigation Choice
    nav_options = ["🧭 Explore Gatherings", "➕ Submit Event", "📑 My Dashboard"]
    if current_role == "admin":
        nav_options.append(f"🛡️ Admin Moderation Queue ({pending_count})")
        
    selected_nav = st.radio("Navigation", nav_options, index=0)
    
    st.divider()
    st.caption("3rd-Semester CSE Community Engagement Project • Bengaluru, Karnataka")

# -----------------------------------------------------------------------------
# 4. VIEW: EXPLORE & DISCOVER FEED
# -----------------------------------------------------------------------------
if selected_nav == "🧭 Explore Gatherings":
    # Hero Section
    st.markdown("""
    <div class="hero-banner">
        <div class="hero-title">Discover Bengaluru’s Vibrant Neighborhood Events & Festivals</div>
        <div class="hero-subtitle">
            Connecting residents to historic cultural fairs, twilight classical recitals, artisan pottery workshops, and community green drives across Namma Ooru.
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Filters Row 1: Search & Neighborhood
    col_search, col_neigh, col_cat = st.columns([2, 1.2, 1.2])
    with col_search:
        search_query = st.text_input("🔍 Search events", placeholder="Search title, neighborhood (e.g. Basavanagudi), or description...", label_visibility="collapsed")
    with col_neigh:
        neighborhoods = ["All Neighborhoods"] + sorted(list({e.get("neighborhood") for e in st.session_state.events if e.get("neighborhood")}))
        selected_neighborhood = st.selectbox("Neighborhood", neighborhoods, label_visibility="collapsed")
    with col_cat:
        categories = ["All Categories", "Cultural Festival", "Workshop", "Music & Arts", "Food & Bazaar", "Community Drive", "Sports"]
        selected_category = st.selectbox("Category", categories, label_visibility="collapsed")
        
    # Filters Row 2: Toggles
    col_t1, col_t2, col_clear = st.columns([1.5, 1.5, 3])
    with col_t1:
        free_only = st.checkbox("🎟️ Free Entry Only", value=False)
    with col_t2:
        weekend_only = st.checkbox("📅 This Weekend Only", value=False)
    with col_clear:
        pass

    # Filter Logic (Approved events only for public feed)
    filtered = [e for e in st.session_state.events if e.get("status") == "approved"]
    
    if search_query:
        sq = search_query.lower().strip()
        filtered = [e for e in filtered if sq in e.get("title", "").lower() or sq in e.get("description", "").lower() or sq in e.get("neighborhood", "").lower() or sq in e.get("venueName", "").lower()]
        
    if selected_neighborhood != "All Neighborhoods":
        filtered = [e for e in filtered if e.get("neighborhood") == selected_neighborhood]
        
    if selected_category != "All Categories":
        filtered = [e for e in filtered if e.get("category") == selected_category]
        
    if free_only:
        filtered = [e for e in filtered if e.get("isFree", False)]
        
    if weekend_only:
        today = datetime.now()
        # Find Saturday & Sunday dates
        day_of_week = today.weekday()
        days_to_sat = (5 - day_of_week) % 7
        sat_date = (today + timedelta(days=days_to_sat)).strftime("%Y-%m-%d")
        sun_date = (today + timedelta(days=days_to_sat + 1)).strftime("%Y-%m-%d")
        filtered = [e for e in filtered if e.get("date") in [sat_date, sun_date]]

    st.markdown(f"<div style='font-size: 0.95rem; font-weight: 700; color: #475569; margin: 12px 0;'>Showing {len(filtered)} verified neighborhood gatherings</div>", unsafe_allow_html=True)

    if not filtered:
        st.warning("No neighborhood events found matching your filter criteria. Try clearing search keywords or selecting 'All Categories'.")
    else:
        # Display in a clean 2-column grid
        col_left, col_right = st.columns(2)
        for i, event in enumerate(filtered):
            target_col = col_left if (i % 2 == 0) else col_right
            
            with target_col:
                with st.container():
                    # Parse Date
                    try:
                        ed = datetime.strptime(event.get("date"), "%Y-%m-%d")
                        fmt_date = ed.strftime("%a, %d %b %Y")
                    except Exception:
                        fmt_date = event.get("date")

                    cat = event.get("category", "Cultural Festival")
                    cat_badge = CATEGORY_BADGES.get(cat, "badge-terracotta")
                    price_badge = '<span class="badge badge-free">Free Entry</span>' if event.get("isFree") else f'<span class="badge badge-price">₹{event.get("ticketPrice")}</span>'
                    
                    # Image
                    st.image(event.get("bannerImage"), use_container_width=True)
                    
                    st.markdown(f"""
                    <div style="margin-top: 4px;">
                        <span class="badge {cat_badge}">{cat}</span>
                        {price_badge}
                        <span class="badge" style="background:#F1F5F9; color:#475569;">📍 {event.get('neighborhood')}</span>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 8px 0 4px 0;">{event.get('title')}</h3>
                    <p style="color: #64748B; font-size: 0.9rem; line-height: 1.4; margin-bottom: 8px;">
                        {event.get('description')[:140]}...
                    </p>
                    <div style="font-size: 0.85rem; color: #334155; margin-bottom: 8px;">
                        🗓️ <strong>{fmt_date}</strong> &nbsp;•&nbsp; ⏰ <strong>{event.get('startTime')} – {event.get('endTime')}</strong><br/>
                        🏛️ {event.get('venueName')}, {event.get('address')}
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Interactive Action Buttons Row
                    c_rsvp, c_save, c_map = st.columns([1.2, 1.2, 1.2])
                    
                    # Current user RSVP and Saved state
                    is_rsvped = event["id"] in current_user.get("rsvped_events", [])
                    is_saved = event["id"] in current_user.get("saved_events", [])
                    
                    with c_rsvp:
                        rsvp_label = "✅ Going" if is_rsvped else f"✋ RSVP ({event.get('attendeesCount', 0)})"
                        if st.button(rsvp_label, key=f"rsvp_{event['id']}_{selected_persona}", use_container_width=True):
                            if selected_persona == "guest":
                                st.warning("Please switch to Citizen or Organizer persona to RSVP!")
                            else:
                                if is_rsvped:
                                    current_user["rsvped_events"].remove(event["id"])
                                    event["attendeesCount"] = max(0, event.get("attendeesCount", 1) - 1)
                                    st.toast("RSVP cancelled", icon="ℹ️")
                                else:
                                    current_user["rsvped_events"].append(event["id"])
                                    event["attendeesCount"] = event.get("attendeesCount", 0) + 1
                                    st.toast("RSVP confirmed! See you there! 🎉", icon="✅")
                                save_data(st.session_state.events, st.session_state.users)
                                st.rerun()

                    with c_save:
                        save_label = "❤️ Saved" if is_saved else "🤍 Save"
                        if st.button(save_label, key=f"save_{event['id']}_{selected_persona}", use_container_width=True):
                            if selected_persona == "guest":
                                st.warning("Please switch to Citizen or Organizer persona to bookmark!")
                            else:
                                if is_saved:
                                    current_user["saved_events"].remove(event["id"])
                                    st.toast("Removed from your bookmarks", icon="🗑️")
                                else:
                                    current_user["saved_events"].append(event["id"])
                                    st.toast("Saved to your personal dashboard!", icon="❤️")
                                save_data(st.session_state.events, st.session_state.users)
                                st.rerun()
                                
                    with c_map:
                        maps_q = urllib.parse.quote(f"{event.get('venueName')}, {event.get('address')}, Bengaluru")
                        st.link_button("📍 Map", f"https://www.google.com/maps/search/?api=1&query={maps_q}", use_container_width=True)

                    st.markdown("<hr style='margin: 16px 0; border: 0; border-top: 1px solid #E2E8F0;'>", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 5. VIEW: SUBMIT EVENT (With Live Card Preview)
# -----------------------------------------------------------------------------
elif selected_nav == "➕ Submit Event":
    st.markdown("""
    <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; margin-bottom: 4px;">Host a Neighborhood Event or Festival</h2>
        <p style="color: #64748B; font-size: 0.95rem;">
            Empower local artisans, trusts, and resident communities. Verified community moderators will review your submission before publishing to the public feed.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    col_form, col_prev = st.columns([1.2, 1])
    
    with col_form:
        with st.form("submit_event_form", clear_on_submit=False):
            title = st.text_input("Event Title *", placeholder="e.g. Basavanagudi Heritage Walk")
            description = st.text_area("Detailed Description *", placeholder="Highlight the cultural, artistic, or civic experience...", height=120)
            
            c_cat, c_neigh = st.columns(2)
            with c_cat:
                category = st.selectbox("Category *", ["Cultural Festival", "Workshop", "Music & Arts", "Food & Bazaar", "Community Drive", "Sports"])
            with c_neigh:
                neighborhood = st.selectbox("Neighborhood *", ["Basavanagudi", "Malleshwaram", "Indiranagar", "Jayanagar", "Koramangala", "Sadashivanagar", "Hebbal", "Sampangi Rama Nagar", "Tigalarpet", "Whitefield", "HSR Layout"])
                
            c_date, c_st, c_et = st.columns([1.2, 1, 1])
            with c_date:
                event_date = st.date_input("Event Date *", min_value=datetime.today())
            with c_st:
                start_time = st.text_input("Start Time *", value="10:00 AM")
            with c_et:
                end_time = st.text_input("End Time *", value="01:00 PM")
                
            venue_name = st.text_input("Venue / Landmark Name *", placeholder="e.g. Seetha Rama Bhavana & Courtyard")
            address = st.text_input("Street Address *", placeholder="e.g. 8th Cross, Margosa Road, Malleshwaram")
            
            c_free, c_price = st.columns([1, 1.5])
            with c_free:
                is_free = st.checkbox("Free Entry", value=True)
            with c_price:
                ticket_price = st.number_input("Ticket Price (₹)", min_value=0, value=0, disabled=is_free)
                
            preset_banners = [
                ("Cultural Festival / Temple Fair", "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80"),
                ("Classical Carnatic Recital", "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80"),
                ("Pottery / Terracotta Workshop", "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80"),
                ("Cubbon Park Sunday Book Bazaar", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80"),
                ("Lake Cleanup / Eco Drive", "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80"),
                ("Street Food & Filter Coffee Fest", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"),
            ]
            banner_choice = st.selectbox("Select Banner Theme", [name for name, _ in preset_banners])
            selected_banner_url = next(url for name, url in preset_banners if name == banner_choice)
            
            submit_btn = st.form_submit_button("🚀 Submit Event for Moderation", use_container_width=True)
            
            if submit_btn:
                if not title.strip() or not description.strip() or not venue_name.strip() or not address.strip():
                    st.error("Please fill in all mandatory fields (Title, Description, Venue, and Address).")
                else:
                    new_id = str(len(st.session_state.events) + 1)
                    auto_approve = (current_user.get("role") == "admin")
                    
                    new_event = {
                        "id": new_id,
                        "title": title.strip(),
                        "description": description.strip(),
                        "category": category,
                        "date": event_date.strftime("%Y-%m-%d"),
                        "startTime": start_time,
                        "endTime": end_time,
                        "venueName": venue_name.strip(),
                        "address": address.strip(),
                        "neighborhood": neighborhood,
                        "isFree": is_free,
                        "ticketPrice": 0 if is_free else int(ticket_price),
                        "organizerEmail": current_user.get("email", "organizer@utsavlocal.in"),
                        "organizerName": current_user.get("name", "Event Organizer"),
                        "status": "approved" if auto_approve else "pending",
                        "attendeesCount": 0,
                        "bannerImage": selected_banner_url,
                    }
                    st.session_state.events.append(new_event)
                    save_data(st.session_state.events, st.session_state.users)
                    
                    if auto_approve:
                        st.success("🎉 Event created and published immediately (Admin auto-approval)!")
                    else:
                        st.success("✅ Event submitted successfully! It has been placed in the Community Admin Moderation Queue.")
                    st.rerun()

    with col_prev:
        st.markdown("**Live Event Card Preview:**")
        st.image(selected_banner_url, use_container_width=True)
        st.markdown(f"""
        <div style="background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;">
            <span class="badge badge-terracotta">{category}</span>
            <span class="badge" style="background:#F1F5F9; color:#475569;">📍 {neighborhood}</span>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 8px 0 4px 0;">{title if title else 'Your Event Title Here'}</h3>
            <p style="color: #64748B; font-size: 0.85rem;">{description if description else 'Detailed description will appear here as you type in the form...'}</p>
            <div style="font-size: 0.8rem; color: #334155;">
                🗓️ <strong>{event_date.strftime("%a, %d %b %Y")}</strong> &nbsp;•&nbsp; ⏰ <strong>{start_time} - {end_time}</strong><br/>
                🏛️ {venue_name if venue_name else 'Venue'}, {address if address else 'Bengaluru'}
            </div>
        </div>
        """, unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# 6. VIEW: CITIZEN & ORGANIZER DASHBOARD
# -----------------------------------------------------------------------------
elif selected_nav == "📑 My Dashboard":
    st.markdown(f"""
    <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; margin-bottom: 4px;">My Community Schedule & Bookmarks</h2>
        <p style="color: #64748B; font-size: 0.95rem;">
            Logged in as <strong>{current_user.get('name')}</strong> ({current_user.get('email')})
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    tab_rsvps, tab_saved, tab_sub = st.tabs(["🗓️ Upcoming RSVPs", "❤️ Bookmarked Gatherings", "🎪 My Submitted Events"])
    
    all_events_dict = {e["id"]: e for e in st.session_state.events}
    
    with tab_rsvps:
        rsvped_ids = current_user.get("rsvped_events", [])
        user_rsvps = [all_events_dict[eid] for eid in rsvped_ids if eid in all_events_dict]
        
        if not user_rsvps:
            st.info("You haven't RSVPed to any upcoming events yet. Explore the feed to RSVP!")
        else:
            for ev in user_rsvps:
                c1, c2, c3 = st.columns([1, 3, 1])
                with c1:
                    st.image(ev.get("bannerImage"), use_container_width=True)
                with c2:
                    st.markdown(f"**{ev.get('title')}**\n\n🗓️ {ev.get('date')} ({ev.get('startTime')}) • 📍 {ev.get('neighborhood')}\n\n🏛️ {ev.get('venueName')}")
                with c3:
                    if st.button("Cancel RSVP", key=f"cancel_rsvp_{ev['id']}"):
                        current_user["rsvped_events"].remove(ev["id"])
                        ev["attendeesCount"] = max(0, ev.get("attendeesCount", 1) - 1)
                        save_data(st.session_state.events, st.session_state.users)
                        st.toast("RSVP cancelled", icon="ℹ️")
                        st.rerun()
                st.divider()

    with tab_saved:
        saved_ids = current_user.get("saved_events", [])
        user_saved = [all_events_dict[eid] for eid in saved_ids if eid in all_events_dict]
        
        if not user_saved:
            st.info("No saved bookmarks yet. Click the ❤️ button on any event card to save it for later!")
        else:
            for ev in user_saved:
                c1, c2, c3 = st.columns([1, 3, 1])
                with c1:
                    st.image(ev.get("bannerImage"), use_container_width=True)
                with c2:
                    st.markdown(f"**{ev.get('title')}**\n\n🗓️ {ev.get('date')} ({ev.get('startTime')}) • 📍 {ev.get('neighborhood')}\n\n🏛️ {ev.get('venueName')}")
                with c3:
                    if st.button("Remove Bookmark", key=f"del_saved_{ev['id']}"):
                        current_user["saved_events"].remove(ev["id"])
                        save_data(st.session_state.events, st.session_state.users)
                        st.toast("Bookmark removed", icon="🗑️")
                        st.rerun()
                st.divider()

    with tab_sub:
        submitted = [e for e in st.session_state.events if e.get("organizerEmail") == current_user.get("email")]
        if not submitted:
            st.info("You haven't submitted any neighborhood events under this persona.")
        else:
            for ev in submitted:
                c1, c2, c3 = st.columns([1, 3, 1])
                status = ev.get("status", "pending")
                badge_cls = f"status-{status}"
                with c1:
                    st.image(ev.get("bannerImage"), use_container_width=True)
                with c2:
                    st.markdown(f"""
                    <span class="{badge_cls}">{status.upper()}</span>
                    <h4 style="margin: 6px 0 2px 0;">{ev.get('title')}</h4>
                    <small>🗓️ {ev.get('date')} ({ev.get('startTime')}) • 📍 {ev.get('neighborhood')}<br/>
                    👥 <strong>{ev.get('attendeesCount', 0)}</strong> citizens going</small>
                    """, unsafe_allow_html=True)
                with c3:
                    if st.button("Delete Event", key=f"del_sub_{ev['id']}"):
                        st.session_state.events = [e for e in st.session_state.events if e["id"] != ev["id"]]
                        save_data(st.session_state.events, st.session_state.users)
                        st.toast("Event deleted", icon="🗑️")
                        st.rerun()
                st.divider()

# -----------------------------------------------------------------------------
# 7. VIEW: ADMIN MODERATION PANEL
# -----------------------------------------------------------------------------
elif selected_nav.startswith("🛡️ Admin Moderation Queue"):
    st.markdown("""
    <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <span class="badge badge-rose">Admin Moderation Queue</span>
        <h2 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; margin: 6px 0 4px 0;">Event Verification & Trust Center</h2>
        <p style="color: #64748B; font-size: 0.95rem;">
            Review incoming submissions from Bengaluru organizers, verify venue legitimacy, and approve gatherings for the public feed.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # KPIs
    app_count = sum(1 for e in st.session_state.events if e.get("status") == "approved")
    pend_count = sum(1 for e in st.session_state.events if e.get("status") == "pending")
    rej_count = sum(1 for e in st.session_state.events if e.get("status") == "rejected")
    tot_rsvps = sum(e.get("attendeesCount", 0) for e in st.session_state.events if e.get("status") == "approved")
    
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f'<div class="metric-card"><div class="metric-value">{app_count}</div><div class="metric-label">Approved Live</div></div>', unsafe_allow_html=True)
    with m2:
        st.markdown(f'<div class="metric-card"><div class="metric-value" style="color: #D97706;">{pend_count}</div><div class="metric-label">Pending Verification</div></div>', unsafe_allow_html=True)
    with m3:
        st.markdown(f'<div class="metric-card"><div class="metric-value" style="color: #059669;">{tot_rsvps}</div><div class="metric-label">Total Citizen RSVPs</div></div>', unsafe_allow_html=True)
    with m4:
        st.markdown(f'<div class="metric-card"><div class="metric-value" style="color: #64748B;">{rej_count}</div><div class="metric-label">Rejected</div></div>', unsafe_allow_html=True)
        
    st.markdown("<h3 style='margin-top: 24px; font-weight: 800;'>Pending Submissions Awaiting Moderation</h3>", unsafe_allow_html=True)
    
    pending_list = [e for e in st.session_state.events if e.get("status") == "pending"]
    
    if not pending_list:
        st.success("🎉 All caught up! There are currently no pending event submissions in the queue.")
    else:
        for ev in pending_list:
            with st.container():
                c_img, c_body, c_act = st.columns([1, 2.5, 1])
                with c_img:
                    st.image(ev.get("bannerImage"), use_container_width=True)
                with c_body:
                    st.markdown(f"""
                    <span class="badge badge-amber">{ev.get('category')}</span>
                    <span class="badge" style="background:#F1F5F9; color:#475569;">📍 {ev.get('neighborhood')}</span>
                    <h3 style="margin: 6px 0 4px 0; font-weight: 800;">{ev.get('title')}</h3>
                    <p style="color: #64748B; font-size: 0.9rem; margin-bottom: 6px;">{ev.get('description')}</p>
                    <div style="font-size: 0.85rem; color: #334155;">
                        🗓️ <strong>{ev.get('date')}</strong> &nbsp;•&nbsp; ⏰ <strong>{ev.get('startTime')} – {ev.get('endTime')}</strong><br/>
                        🏛️ {ev.get('venueName')}, {ev.get('address')}<br/>
                        👤 <em>Submitted by: {ev.get('organizerName')} ({ev.get('organizerEmail')})</em>
                    </div>
                    """, unsafe_allow_html=True)
                with c_act:
                    st.write("")
                    st.write("")
                    if st.button("✅ Approve & Publish", key=f"app_{ev['id']}", use_container_width=True):
                        ev["status"] = "approved"
                        save_data(st.session_state.events, st.session_state.users)
                        st.toast(f"'{ev.get('title')}' approved and published live!", icon="🎉")
                        st.rerun()
                        
                    if st.button("❌ Reject Submission", key=f"rej_{ev['id']}", use_container_width=True):
                        ev["status"] = "rejected"
                        save_data(st.session_state.events, st.session_state.users)
                        st.toast(f"'{ev.get('title')}' rejected.", icon="ℹ️")
                        st.rerun()
                        
                st.divider()
