// ======================
// DEXIE DATABASE
// ======================
const db = new Dexie("ImproveXDB");

db.version(1).stores({
    profile: "id",
    tasks: "id, title, goalId, category, priority, status, deadline",
    goals: "id, title, deadline",
    habits: "id, title",
    dailyStats: "date",
    history: "++id, timestamp",
    settings: "id",
});

// ======================
// UTILITIES
// ======================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast`;

    let icon = "check_circle";
    if (type === "error") icon = "error";
    if (type === "info") icon = "info";

    toast.innerHTML = `<span class="material-symbols-outlined text-${type === "error" ? "accent" : "success"}">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function getTodayDateString() {
    return new Date().toISOString().split("T")[0];
}

async function logActivity(action) {
    await db.history.add({
        action,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: getTodayDateString()
    });
}

// ======================
// NAVIGATION
// ======================
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-item");
    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");

            navButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            document.querySelectorAll(".page").forEach((page) => {
                page.classList.remove("active");
            });

            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.add("active");
                // Refresh data for specific page views
                if (targetId === "page-home") renderHome();
                if (targetId === "page-goals") renderGoals();
                if (targetId === "page-status") renderStatus();
                if (targetId === "page-profile") renderProfile();
            }
        });
    });
}

// ======================
// INITIALIZATION & SEEDING
// ======================
async function initApp() {
    // Check initial profile setup
    let profile = await db.profile.get(1);
    if (!profile) {
        await db.profile.put({
            id: 1,
            username: "User",
            bio: "Welcome to ImproveX! Set your goals and conquer your daily tasks.",
            age: 25,
            gender: "Prefer not to say",
            country: "Unknown",
            occupation: "Professional",
            joinDate: new Date().toLocaleDateString(),
            coins: 0,
            xp: 0,
            level: 1,
            completedTasks: 0,
            goalsCount: 0,
            streak: 0
        });
    }

    let settings = await db.settings.get(1);
    if (!settings) {
        // Detect if the user's system/phone is currently in dark mode
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        await db.settings.put({ id: 1, darkMode: systemPrefersDark, notifications: true });
        applyTheme(systemPrefersDark);
    } else {
        applyTheme(settings.darkMode);
    }

    const goalCount = await db.goals.count();
    if (goalCount === 0) {
       // Goal 1: Health & Fitness (Hard)
        const goal1Id = "goal_" + Date.now();
        await db.goals.put({
            id: goal1Id,
            title: "Build Consistent Daily Fitness & Health",
            description: "Establish an active routine with regular workouts, proper hydration, and healthy nutrition habits.",
            category: "Fitness",
            deadline: "2026-12-31",
            color: "#10b981"
        });

        // Goal 2: Career & Skills (Hard)
        const goal2Id = "goal_" + (Date.now() + 1);
        await db.goals.put({
            id: goal2Id,
            title: "Advance Professional Skills & Productivity",
            description: "Upskill through focused daily learning, project execution, and mastering time management.",
            category: "Work",
            deadline: "2026-12-31",
            color: "#3b82f6"
        });

        // Goal 3: Personal Growth & Finance (Medium)
        const goal3Id = "goal_" + (Date.now() + 2);
        await db.goals.put({
            id: goal3Id,
            title: "Master Personal Finance & Lifelong Learning",
            description: "Read regularly, build a consistent savings habit, and organize personal milestones.",
            category: "Finance",
            deadline: "2026-12-31",
            color: "#ec4899"
        });

        // Goal 4: Mindfulness & Mental Peace (Easy)
        const goal4Id = "goal_" + (Date.now() + 3);
        await db.goals.put({
            id: goal4Id,
            title: "Daily Mindfulness & Stress Reduction",
            description: "Practice 10 minutes of daily meditation, breathing exercises, or journaling to clear the mind.",
            category: "Mindfulness",
            deadline: "2026-11-30",
            color: "#14b8a6"
        });

        // Goal 5: Tech & Coding Mastery (Hard)
        const goal5Id = "goal_" + (Date.now() + 4);
        await db.goals.put({
            id: goal5Id,
            title: "Ship a Fullstack Web Application",
            description: "Design, develop, test, and deploy a complete production-ready app from scratch.",
            category: "Tech",
            deadline: "2026-10-15",
            color: "#0284c7"
        });

        // Goal 6: Creative Expression (Easy)
        const goal6Id = "goal_" + (Date.now() + 5);
        await db.goals.put({
            id: goal6Id,
            title: "Explore Creative Hobbies & Design",
            description: "Spend time sketching, writing, or learning digital design principles weekly.",
            category: "Creative",
            deadline: "2026-12-31",
            color: "#d946ef"
        });

        // Goal 7: Adventure & Travel (Medium)
        const goal7Id = "goal_" + (Date.now() + 6);
        await db.goals.put({
            id: goal7Id,
            title: "Plan and Execute Dream Explorations",
            description: "Research, budget, and take meaningful weekend trips or international travels.",
            category: "Travel",
            deadline: "2026-09-30",
            color: "#f59e0b"
        });

        // Goal 8: Home Organization & Upkeep (Easy)
        const goal8Id = "goal_" + (Date.now() + 7);
        await db.goals.put({
            id: goal8Id,
            title: "Maintain an Organized & Peaceful Home",
            description: "Keep living spaces decluttered, clean, and optimized for daily productivity and rest.",
            category: "Home",
            deadline: "2026-12-31",
            color: "#84cc16"
        });

        await db.tasks.bulkPut([
    // 🌅 Early Morning (4:00 AM – 7:00 AM)
    {
        id: "task_" + Date.now() + "_1",
        title: "Wake up",
        description: "Rise early to start your day strong.",
        timeSlot: "early-morning",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Avoid hitting snooze"
    },
    {
        id: "task_" + Date.now() + "_2",
        title: "Drink a glass of water",
        description: "Hydrate immediately after waking up.",
        timeSlot: "early-morning",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Room temperature water"
    },
    {
        id: "task_" + Date.now() + "_3",
        title: "Make your bed",
        description: "Start your morning with a quick, productive win.",
        timeSlot: "early-morning",
        category: "Personal",
        difficulty: "Easy",
        priority: "Low",
        xpReward: 5,
        coinReward: 2,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Keep your living space tidy"
    },
    {
        id: "task_" + Date.now() + "_4",
        title: "Brush your teeth & Wash your face",
        description: "Freshen up for the day ahead.",
        timeSlot: "early-morning",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Skincare and hygiene basics"
    },
    {
        id: "task_" + Date.now() + "_5",
        title: "Pray or meditate",
        description: "Center your mind and set a positive spiritual tone.",
        timeSlot: "early-morning",
        category: "Wellness",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "5 to 10 minutes of mindfulness"
    },
    {
        id: "task_" + Date.now() + "_6",
        title: "Stretch or do yoga",
        description: "Awaken your muscles and improve flexibility.",
        timeSlot: "early-morning",
        category: "Fitness",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Focus on deep breathing"
    },
    {
        id: "task_" + Date.now() + "_7",
        title: "Go for a morning walk or light run",
        description: "Get some fresh air and cardiovascular movement.",
        timeSlot: "early-morning",
        category: "Fitness",
        difficulty: "Medium",
        priority: "High",
        xpReward: 25,
        coinReward: 12,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Maintain a steady pace"
    },

    // 🍳 Late Morning (7:00 AM – 9:00 AM)
    {
        id: "task_" + Date.now() + "_8",
        title: "Take a shower",
        description: "Clean up and refresh after your morning workout.",
        timeSlot: "late-morning",
        category: "Health",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Personal grooming"
    },
    {
        id: "task_" + Date.now() + "_9",
        title: "Eat a healthy breakfast",
        description: "Fuel your body with nutritious food and protein.",
        timeSlot: "late-morning",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Include whole grains and fruits"
    },
    {
        id: "task_" + Date.now() + "_10",
        title: "Review your daily goals",
        description: "Align your mind with what needs to be achieved today.",
        timeSlot: "late-morning",
        category: "Productivity",
        difficulty: "Easy",
        priority: "High",
        xpReward: 15,
        coinReward: 8,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Check off your priority list"
    },
    {
        id: "task_" + Date.now() + "_11",
        title: "Pack your bag/work essentials",
        description: "Ensure you have everything ready before heading out or starting work.",
        timeSlot: "late-morning",
        category: "Productivity",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Check keys, wallet, laptop, and notes"
    },

    // 📚 Mid Morning (9:00 AM – 12:00 PM)
    {
        id: "task_" + Date.now() + "_12",
        title: "Attend classes or work",
        description: "Focus on primary professional or academic duties.",
        timeSlot: "mid-morning",
        category: "Work",
        difficulty: "Hard",
        priority: "Urgent",
        xpReward: 40,
        coinReward: 20,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Stay focused and minimize distractions"
    },
    {
        id: "task_" + Date.now() + "_13",
        title: "Complete your highest-priority task",
        description: "Tackle the hardest or most important task of the day first.",
        timeSlot: "mid-morning",
        category: "Productivity",
        difficulty: "Hard",
        priority: "Urgent",
        xpReward: 50,
        coinReward: 25,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Eat the frog approach"
    },
    {
        id: "task_" + Date.now() + "_14",
        title: "Study or practice a new skill",
        description: "Invest time in self-improvement and learning.",
        timeSlot: "mid-morning",
        category: "Study",
        difficulty: "Medium",
        priority: "High",
        xpReward: 30,
        coinReward: 15,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Read or practice code/languages"
    },
    {
        id: "task_" + Date.now() + "_15",
        title: "Take a short break & Drink water",
        description: "Rest your eyes and keep your body hydrated.",
        timeSlot: "mid-morning",
        category: "Health",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Step away from screen for 5 minutes"
    },

    // ☀️ Early Afternoon (12:00 PM – 3:00 PM)
    {
        id: "task_" + Date.now() + "_16",
        title: "Eat lunch",
        description: "Enjoy a balanced meal to regain midday energy.",
        timeSlot: "early-afternoon",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Include vegetables and clean protein"
    },
    {
        id: "task_" + Date.now() + "_17",
        title: "Take a 10–15 minute walk",
        description: "Aid digestion and stretch your legs after lunch.",
        timeSlot: "early-afternoon",
        category: "Fitness",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Light stroll outdoors"
    },
    {
        id: "task_" + Date.now() + "_18",
        title: "Continue studying or working",
        description: "Maintain productivity during the afternoon block.",
        timeSlot: "early-afternoon",
        category: "Work",
        difficulty: "Medium",
        priority: "High",
        xpReward: 30,
        coinReward: 15,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Keep momentum going"
    },
    {
        id: "task_" + Date.now() + "_19",
        title: "Reply to important messages/emails",
        description: "Clear out communication backlog efficiently.",
        timeSlot: "early-afternoon",
        category: "Work",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 15,
        coinReward: 8,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Batch communications"
    },

    // ⚡ Late Afternoon (3:00 PM – 6:00 PM)
    {
        id: "task_" + Date.now() + "_20",
        title: "Exercise or go to the gym",
        description: "Build physical strength and release afternoon tension.",
        timeSlot: "late-afternoon",
        category: "Fitness",
        difficulty: "Hard",
        priority: "High",
        xpReward: 40,
        coinReward: 20,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Weight training or cardio"
    },
    {
        id: "task_" + Date.now() + "_21",
        title: "Work on a personal project",
        description: "Spend dedicated time on your own creative or side goals.",
        timeSlot: "late-afternoon",
        category: "Personal",
        difficulty: "Medium",
        priority: "Medium",
        xpReward: 30,
        coinReward: 15,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Build something cool"
    },
    {
        id: "task_" + Date.now() + "_22",
        title: "Review your progress",
        description: "Check off completed items and evaluate what's left.",
        timeSlot: "late-afternoon",
        category: "Productivity",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Assess daily output"
    },
    {
        id: "task_" + Date.now() + "_23",
        title: "Organize your workspace",
        description: "Clean your desk and tidy up files to prepare for tomorrow.",
        timeSlot: "late-afternoon",
        category: "Productivity",
        difficulty: "Easy",
        priority: "Low",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "A clean desk is a clean mind"
    },

    // 🌇 Evening (6:00 PM – 9:00 PM)
    {
        id: "task_" + Date.now() + "_24",
        title: "Eat dinner",
        description: "Enjoy a wholesome, lighter evening meal.",
        timeSlot: "evening",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Avoid overly heavy or oily foods late"
    },
    {
        id: "task_" + Date.now() + "_25",
        title: "Spend time with family or friends",
        description: "Nurture your social connections and relationships.",
        timeSlot: "evening",
        category: "Wellness",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 20,
        coinReward: 10,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Quality time without screens"
    },
    {
        id: "task_" + Date.now() + "_26",
        title: "Read a book or learn something new",
        description: "Expand your horizon through leisure reading or a documentary.",
        timeSlot: "evening",
        category: "Personal",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 20,
        coinReward: 10,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Read at least 15-20 pages"
    },
    {
        id: "task_" + Date.now() + "_27",
        title: "Plan tomorrow's schedule",
        description: "Set your game plan so you can wake up with clarity.",
        timeSlot: "evening",
        category: "Productivity",
        difficulty: "Medium",
        priority: "High",
        xpReward: 20,
        coinReward: 10,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Write down top priorities for tomorrow"
    },

    // 🌙 Night (9:00 PM – 11:00 PM)
    {
        id: "task_" + Date.now() + "_28",
        title: "Brush your teeth & Skin care",
        description: "Nighttime hygiene routine.",
        timeSlot: "night",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Prepare body for sleep"
    },
    {
        id: "task_" + Date.now() + "_29",
        title: "Journal your day & Practice gratitude",
        description: "Reflect on accomplishments and things you are thankful for.",
        timeSlot: "night",
        category: "Wellness",
        difficulty: "Easy",
        priority: "Medium",
        xpReward: 15,
        coinReward: 7,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Write down 3 things you're grateful for"
    },
    {
        id: "task_" + Date.now() + "_30",
        title: "Avoid screens (digital detox)",
        description: "Keep phones and laptops away to improve sleep quality.",
        timeSlot: "night",
        category: "Health",
        difficulty: "Medium",
        priority: "High",
        xpReward: 20,
        coinReward: 10,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "No blue light before bed"
    },
    {
        id: "task_" + Date.now() + "_31",
        title: "Prepare clothes for tomorrow",
        description: "Save decision fatigue for the morning by planning ahead.",
        timeSlot: "night",
        category: "Productivity",
        difficulty: "Easy",
        priority: "Low",
        xpReward: 10,
        coinReward: 5,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Keep outfit ready"
    },

    // 😴 Late Night (11:00 PM – 4:00 AM)
    {
        id: "task_" + Date.now() + "_32",
        title: "Sleep",
        description: "Get 7-8 hours of deep, restorative rest.",
        timeSlot: "late-night",
        category: "Health",
        difficulty: "Easy",
        priority: "High",
        xpReward: 25,
        coinReward: 15,
        deadline: getTodayDateString(),
        repeat: "Daily",
        status: false,
        notes: "Recharge for tomorrow's streak"
    }
]);
    }
    
    const quote = getRandomQuote();
    await sendSystemNotification(quote.title, quote.body);

    initNavigation();
    initModals();
    initForms();
    initThemeToggle();
    initDangerZone();
    initAvatarHandler();

    await renderHome();
}
//
// ======================
// HOME
// ======================
async function renderHome(filterType = "today") {
    const profile = await db.profile.get(1);
    if (!profile) return;

    // Dynamic hourly & 10-minute friendly greeting logic
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const tenMinuteBlock = Math.floor(currentMinute / 10);

    const hourlyGreetings = {
        4: [
            "Early bird mode activated! Let's get things rolling 🌅",
            "Up before the sun? Absolute dedication!",
            "Quiet morning vibes. Perfect time to plan ahead."
        ],
        5: [
            "Rise and shine! Ready to conquer the day? ☕",
            "The day is yours to shape. Let's make it count!",
            "Fresh coffee, fresh mind. Let's do this!"
        ],
        6: [
            "How's the morning going? Let's make it productive 🚀",
            "Early hours are the best hours for focus.",
            "Smooth start to the morning—keep that energy up!"
        ],
        7: [
            "Good morning! Grab a coffee and let's dive in 🥐",
            "Morning routine locked in? Let's tackle your top goal.",
            "Bright and early! What's our first big win today?"
        ],
        8: [
            "Morning energy is high! What's the main focus today? 🔥",
            "The workday is kicking off. You've got this!",
            "Let's channel this morning motivation into action."
        ],
        9: [
            "Hope your morning is off to a flying start! ⚡",
            "In the zone right now? Let's check off some tasks.",
            "Steady progress makes for a fantastic morning."
        ],
        10: [
            "Mid-morning check-in—how are things tracking? 🎯",
            "Taking a quick break or crushing goals? Keep it up!",
            "You're halfway through the morning shift—stay sharp!"
        ],
        11: [
            "Almost lunchtime! Let's finish these tasks strong 🥗",
            "Push through the final stretch before lunch!",
            "Great work so far this morning. Let's close out strong."
        ],
        12: [
            "It's noon! Take a breather and reset for the afternoon ☀️",
            "Lunchtime recharge! Step away and grab some fuel.",
            "Midday checkpoint reached. How are you feeling?"
        ],
        13: [
            "How's the afternoon treating you so far? ⛅",
            "Back to the grind after lunch—let's ease into it.",
            "Afternoon session unlocked. What's next on the list?"
        ],
        14: [
            "Afternoon slump? Let's crush a quick task to bounce back 🔋",
            "Shake off the midday fatigue—you're doing awesome!",
            "Time for a quick stretch and a fresh burst of energy."
        ],
        15: [
            "Keep up the momentum! You're doing great 📈",
            "The afternoon is flying by. Stay focused!",
            "Knocking tasks out left and right—love to see it."
        ],
        16: [
            "Late afternoon push—let's wrap up strong 🌇",
            "The finish line for the workday is in sight!",
            "Final stretch of productive hours. Make 'em count."
        ],
        17: [
            "Evening is rolling in. How did today go? 🌆",
            "Transitioning from work mode to personal time nicely.",
            "Take a moment to appreciate what you accomplished today."
        ],
        18: [
            "Wind down or push through? You've got this 💪",
            "Evening routine time—balance is everything.",
            "Dinner time or hobby time? Enjoy the evening!"
        ],
        19: [
            "Hope you're having a relaxing evening! 🛋️",
            "Unwinding and relaxing? You've earned it.",
            "Calm evening vibes. Take it easy."
        ],
        20: [
            "Evening vibes. Time to review or unwind? 🌙",
            "Reflecting on the day or chilling out with a show?",
            "Wrapping up loose ends or purely relaxing?"
        ],
        21: [
            "Wrapping up the day? Pat yourself on the back ⭐",
            "Getting cozy as the night settles in.",
            "Time to prep your mindset for a peaceful night."
        ],
        22: [
            "Night owl mode. Keep it chill and restorative 🦉",
            "Quiet night hours. Perfect for light reading or relaxing.",
            "Winding down the digital screens soon?"
        ],
        23: [
            "Getting late! Time to start winding down 🌌",
            "Midnight approaches. Don't push too hard tonight!",
            "Time to let the brain rest and recharge for tomorrow."
        ],
        0: [
            "Burning the midnight oil, aren't we? 🌃",
            "Late night thoughts and late night focus.",
            "Make sure you get your Zs soon!"
        ],
        1: [
            "Late night focus. Don't forget to rest soon! 🌠",
            "The house is quiet. Rest is just as important as work.",
            "Still awake? Take care of yourself."
        ],
        2: [
            "Quiet hours. Hope you're resting well 🌙",
            "Deep night stillness. Sweet slumber.",
            "Peaceful dreams..."
        ],
        3: [
            "The world is asleep. Sweet dreams! 💤",
            "Night's darkest hour before the new dawn.",
            "Rest up for an amazing tomorrow."
        ]
    };

    const messages = hourlyGreetings[currentHour] || ["Have a great day ahead!"];
    const greeting = messages[tenMinuteBlock % messages.length];

    // Header info
    document.getElementById("home-greeting").innerText = `${greeting} ${profile.username}!!`;
    document.getElementById("home-date").innerText = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric"
    });
    document.getElementById("home-streak").innerText = profile.streak;
    document.getElementById("home-xp").innerText = profile.xp;
    document.getElementById("home-coins").innerText = profile.coins;

    // Tasks counts & progress
    const tasks = await db.tasks.toArray();
    const todayStr = getTodayDateString();

    // Filter tasks based on selected chip
    let displayedTasks = tasks;
    if (filterType === "today") {
        displayedTasks = tasks.filter(
            (t) => t.deadline === todayStr || (t.repeat && t.repeat.toLowerCase() === "daily")
        );
    } else if (filterType === "tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        displayedTasks = tasks.filter(
            (t) => t.deadline === tomorrowStr || (t.repeat && t.repeat.toLowerCase() === "daily")
        );
    } else if (filterType === "pending") {
        displayedTasks = tasks.filter((t) => !t.status);
    } else if (filterType === "completed") {
        displayedTasks = tasks.filter((t) => t.status);
    }

    const allTasks = tasks;
    const completedTasksCount = allTasks.filter((t) => t.status).length;

    const percent = allTasks.length > 0 ? Math.round((completedTasksCount / allTasks.length) * 100) : 0;

    document.getElementById("home-completion-text").innerText = `${percent}% Completed`;
    document.getElementById("home-progress-bar").style.width = `${percent}%`;

    document.getElementById("home-stat-tasks").innerText = `${completedTasksCount}/${allTasks.length}`;
    document.getElementById("home-stat-level").innerText = `Lvl ${profile.level}`;

    const activeGoals = await db.goals.count();
    document.getElementById("home-stat-goals").innerText = activeGoals;

    renderHomeTasks(displayedTasks);
    renderHomeGoalsPreview();
    setupFilterChipListeners();
    // Render the active time-blocked section
    renderTimeBlockedTasks();
    if (typeof toggleFAB === "function") toggleFAB(true);
}

// Helper function to toggle FAB visibility
function toggleFAB(show) {
    const fabBtn = document.getElementById("fab-add-task");
    if (!fabBtn) return;

    if (show) {
        fabBtn.classList.add("visible");
    } else {
        fabBtn.classList.remove("visible");
    }
}

// Add event listeners for the filter chips
function setupFilterChipListeners() {
    const chips = document.querySelectorAll(".filter-chips .chip");
    chips.forEach((chip) => {
        chip.onclick = () => {
            chips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            const filterType = chip.getAttribute("data-filter");
            renderHome(filterType);
        };
    });
}

// Add this pointer/touch-based custom reordering logic to renderHomeTasks

async function renderHomeTasks(tasks) {
    const container = document.getElementById("home-tasks-container");
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = `<div class="glass-card empty-state">No tasks found for this view. Tap + to add one!</div>`;
        return;
    }

   const categoryConfig = {
    Fitness: { icon: "fitness_center", color: "#f97316" },       // Weightlifting / general gym fitness
    Running: { icon: "directions_run", color: "#ea580c" },       // Stickman running
    Cycling: { icon: "directions_bike", color: "#c2410c" },      // Cycling / bike workouts
    Yoga: { icon: "self_improvement", color: "#14b8a6" },        // Yoga & stretching stickman pose
    Health: { icon: "health_and_safety", color: "#10b981" },     // Medical health shield
    Work: { icon: "badge", color: "#3b82f6" },                   // Professional ID / workplace
    Learning: { icon: "menu_book", color: "#84cc16" },           // Open book for learning
    Study: { icon: "school", color: "#8b5cf6" },                 // Graduation cap for studying/exams
    Personal: { icon: "account_circle", color: "#ec4899" },      // Profile / personal tasks
    Finance: { icon: "account_balance_wallet", color: "#059669" },// Wallet for money & budgeting
    Tech: { icon: "code", color: "#0284c7" },                    // Programming code brackets
    Mindfulness: { icon: "spa", color: "#0d9488" },              // Lotus / spa relaxation
    Creative: { icon: "brush", color: "#d946ef" },               // Paintbrush for design and art
    Travel: { icon: "explore", color: "#f59e0b" },               // Compass for trips and travel
    Home: { icon: "house", color: "#65a30d" },                   // House / chores around the home
    Shopping: { icon: "local_mall", color: "#e11d48" },          // Shopping bag
    Default: { icon: "task_alt", color: "#6b7280" }              // Fallback task icon
};

    const getPriorityBadgeStyle = (priority) => {
        const p = (priority || "").toLowerCase();
        if (p === "urgent" || p === "critical") {
            return "background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);";
        } else if (p === "high") {
            return "background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3);";
        } else if (p === "medium" || p === "normal") {
            return "background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3);";
        } else if (p === "low") {
            return "background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);";
        } else {
            return "background: rgba(107, 114, 128, 0.15); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.3);";
        }
    };

    const getPriorityWeight = (priority) => {
        const p = (priority || "").toLowerCase();
        if (p === "urgent" || p === "critical") return 4;
        if (p === "high") return 3;
        if (p === "medium" || p === "normal") return 2;
        if (p === "low") return 1;
        return 0;
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status !== b.status) {
            return a.status ? 1 : -1;
        }
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    });

    container.innerHTML = sortedTasks
        .map((task) => {
            const config = categoryConfig[task.category] || categoryConfig.Default;
            const iconStyle = `font-size: 24px; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${config.color};`;
            const priorityStyle = `padding: 1px 6px; border-radius: 4px; font-weight: 600; ${getPriorityBadgeStyle(task.priority)}`;

           // Inside renderHomeTasks .map() function:
return `
    <div class="task-card ${task.status ? "completed" : ""}" data-id="${task.id}" style="position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease;">
        <div class="task-drag-handle" style="cursor: grab; display: flex; align-items: center; color: var(--text-muted); margin-right: 4px; touch-action: none;" title="Hold and drag to move one position up or down">
            <span class="material-symbols-outlined" style="font-size: 18px;">drag_indicator</span>
        </div>
        <div class="task-left" style="flex: 1; display: flex; align-items: flex-start; gap: 10px;">
            <div class="task-checkbox ${task.status ? "checked" : ""}" onclick="toggleTaskStatus('${task.id}')">
                ${task.status ? '<span class="material-symbols-outlined" style="font-size:16px;">check</span>' : ""}
            </div>
            <span class="material-symbols-outlined" style="${iconStyle}">${config.icon}</span>
            <div class="task-info" style="flex: 1; cursor: pointer;" onclick="toggleTaskExpand(this)">
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <span class="task-title">${task.title}</span>
                    <span class="material-symbols-outlined task-expand-icon" style="font-size: 18px; color: var(--text-muted); transition: transform 0.3s ease;">expand_more</span>
                </div>
                
                <!-- Collapsed details container -->
                <div class="task-expandable-details" style="max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                    ${task.description ? `<div class="task-description" style="font-size: 12px; opacity: 0.7; margin-top: 6px;">${task.description}</div>` : ""}
                    ${task.notes ? `<div class="task-notes" style="font-size: 11px; opacity: 0.8; font-style: italic; margin-top: 4px;">Note: ${task.notes}</div>` : ""}
                    <div class="task-meta" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 11px;">
                        <span>${task.category}</span>
                        <span>•</span>
                        <span>+${task.xpReward} XP</span>
                        <span>•</span>
                        <span>Deadline: ${task.deadline || "None"}</span>
                        <span>•</span>
                        <span>Repeat: ${task.repeat || "None"}</span>
                        <span>•</span>
                        <span>Difficulty: ${task.difficulty || "Medium"}</span>
                        <span>•</span>
                        <span>Priority: <span style="${priorityStyle}">${task.priority || "Normal"}</span></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="task-actions">
            <button onclick="openEditTaskModal('${task.id}')"><span class="material-symbols-outlined" style="font-size:18px;">edit</span></button>
            <button onclick="deleteTask('${task.id}')"><span class="material-symbols-outlined" style="font-size:18px;">delete</span></button>
        </div>
    </div>
`;
        })
        .join("");

    setupStepByStepTaskReordering(container);
}

function toggleTaskExpand(element) {
    const details = element.querySelector(".task-expandable-details");
    const icon = element.querySelector(".task-expand-icon");
    
    if (details.style.maxHeight && details.style.maxHeight !== "0px") {
        details.style.maxHeight = "0px";
        if (icon) icon.style.transform = "rotate(0deg)";
    } else {
        // Set to scrollHeight so it dynamically matches the exact content height
        details.style.maxHeight = details.scrollHeight + "px";
        if (icon) icon.style.transform = "rotate(180deg)";
    }
}
// Allows shifting a task one position up or down relative to its adjacent neighbor when dragged
function setupStepByStepTaskReordering(container) {
    const handles = container.querySelectorAll(".task-drag-handle");

    handles.forEach((handle) => {
        const card = handle.closest(".task-card");
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const onPointerDown = (e) => {
            isDragging = true;
            startY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            handle.style.cursor = "grabbing";
            card.style.zIndex = "1000";
            card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";

            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            currentY = (e.clientY || (e.touches ? e.touches[0].clientY : 0)) - startY;
            card.style.transform = `translateY(${currentY}px)`;

            // If dragged down past ~40px, swap with the immediate next sibling
            if (currentY > 40 && card.nextElementSibling) {
                card.parentNode.insertBefore(card.nextElementSibling, card);
                startY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
                card.style.transform = `translateY(0px)`;
            }
            // If dragged up past ~ -40px, swap with the immediate previous sibling
            else if (currentY < -40 && card.previousElementSibling) {
                card.parentNode.insertBefore(card, card.previousElementSibling);
                startY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
                card.style.transform = `translateY(0px)`;
            }
        };

        const onPointerUp = () => {
            if (!isDragging) return;
            isDragging = false;
            handle.style.cursor = "grab";
            card.style.zIndex = "1";
            card.style.transform = "translateY(0px)";
            card.style.boxShadow = "none";

            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };

        handle.addEventListener("pointerdown", onPointerDown);
    });
}
async function renderHomeGoalsPreview() {
    const container = document.getElementById("home-goals-preview");
    if (!container) return;

    const goals = await db.goals.toArray();
    if (goals.length === 0) {
        container.innerHTML = `<div class="glass-card empty-state">No active goals found.</div>`;
        return;
    }

    const tasks = await db.tasks.toArray();

    // Map goal keywords/categories or use fallback icons and real-world colors
    const getGoalIconAndColor = (title) => {
        const lower = title.toLowerCase();
        if (
            lower.includes("fitness") ||
            lower.includes("marathon") ||
            lower.includes("run") ||
            lower.includes("cardio") ||
            lower.includes("workout") ||
            lower.includes("gym")
        ) {
            return { icon: "directions_run", color: "#f97316" }; // Orange
        } else if (
            lower.includes("health") ||
            lower.includes("diet") ||
            lower.includes("sleep") ||
            lower.includes("nutrition") ||
            lower.includes("water")
        ) {
            return { icon: "favorite", color: "#ef4444" }; // Red heartbeat
        } else if (
            lower.includes("code") ||
            lower.includes("system") ||
            lower.includes("architecture") ||
            lower.includes("tech") ||
            lower.includes("software") ||
            lower.includes("developer") ||
            lower.includes("programming")
        ) {
            return { icon: "terminal", color: "#3b82f6" }; // Blue terminal
        } else if (
            lower.includes("study") ||
            lower.includes("learn") ||
            lower.includes("book") ||
            lower.includes("read") ||
            lower.includes("course") ||
            lower.includes("skill")
        ) {
            return { icon: "menu_book", color: "#8b5cf6" }; // Purple book
        } else if (
            lower.includes("finance") ||
            lower.includes("money") ||
            lower.includes("wealth") ||
            lower.includes("save") ||
            lower.includes("budget") ||
            lower.includes("invest")
        ) {
            return { icon: "payments", color: "#10b981" }; // Green cash
        } else if (
            lower.includes("business") ||
            lower.includes("startup") ||
            lower.includes("project") ||
            lower.includes("work") ||
            lower.includes("career") ||
            lower.includes("job")
        ) {
            return { icon: "work", color: "#0ea5e9" }; // Sky Blue briefcase
        } else if (
            lower.includes("mind") ||
            lower.includes("meditat") ||
            lower.includes("mental") ||
            lower.includes("focus") ||
            lower.includes("peace") ||
            lower.includes("calm")
        ) {
            return { icon: "self_improvement", color: "#14b8a6" }; // Teal mindfulness
        } else if (
            lower.includes("travel") ||
            lower.includes("trip") ||
            lower.includes("adventure") ||
            lower.includes("explore") ||
            lower.includes("vacation")
        ) {
            return { icon: "flight", color: "#f59e0b" }; // Amber travel
        } else if (
            lower.includes("creative") ||
            lower.includes("design") ||
            lower.includes("art") ||
            lower.includes("music") ||
            lower.includes("write") ||
            lower.includes("blog")
        ) {
            return { icon: "palette", color: "#ec4899" }; // Pink art palette
        } else if (
            lower.includes("home") ||
            lower.includes("clean") ||
            lower.includes("organize") ||
            lower.includes("house") ||
            lower.includes("chores")
        ) {
            return { icon: "home", color: "#84cc16" }; // Lime home
        } else {
            return { icon: "flag", color: "#6366f1" }; // Indigo default flag
        }
    };

    container.innerHTML = goals
        .slice(0, 2)
        .map((goal) => {
            const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
            const completedLinked = linkedTasks.filter((t) => t.status).length;
            const progress = linkedTasks.length > 0 ? Math.round((completedLinked / linkedTasks.length) * 100) : 0;

            const goalMeta = getGoalIconAndColor(goal.title);
            // Fallback to goal.color if explicitly provided, else use smart real-world color
            const themeColor = goal.color && goal.color !== "#6366f1" ? goal.color : goalMeta.color;

            return `
            <div class="glass-card" style="margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
                        <span class="material-symbols-outlined" style="font-size: 20px; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${themeColor};">${goalMeta.icon}</span>
                        <h4 style="font-size:0.9rem; font-weight:700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${goal.title}</h4>
                    </div>
                    <span style="font-size:0.8rem; font-weight:600; color:${themeColor}; flex-shrink: 0;">${progress}%</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${progress}%; background: ${themeColor};"></div>
                </div>
            </div>
        `;
        })
        .join("");
}
async function toggleTaskStatus(taskId) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const newStatus = !task.status;
    await db.tasks.update(taskId, { status: newStatus });

    const profile = await db.profile.get(1);
    // Take a snapshot of profile stats before changes
    const oldProfileSnapshot = { ...profile };
    const todayStr = getTodayDateString();

    if (newStatus) {
        profile.xp += task.xpReward;
        profile.coins += task.coinReward;
        profile.completedTasks += 1;
        
        // --- STREAK LOGIC FIX ---
        let dailyStat = await db.dailyStats.get(todayStr);

        if (!dailyStat) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];
            
            const yesterdayStat = await db.dailyStats.get(yesterdayStr);

            if (yesterdayStat && yesterdayStat.completedCount > 0) {
                profile.streak = (profile.streak || 0) + 1;
            } else if (!profile.streak || profile.streak === 0) {
                profile.streak = 1;
            }
            // If they missed yesterday and streak was already > 0, it resets or keeps based on preference. 
            // Standard behavior: if no yesterday activity, reset streak to 1 for today:
            else {
                profile.streak = 1;
            }

            await db.dailyStats.put({ date: todayStr, completedCount: 1 });
        } else {
            dailyStat.completedCount = (dailyStat.completedCount || 0) + 1;
            await db.dailyStats.put(dailyStat);
        }

        if (profile.xp >= profile.level * 200) {
            profile.level += 1;
            showToast(`Level Up! You reached Level ${profile.level}!`, "success");
        } else {
            showToast(`Task completed! +${task.xpReward} XP`, "success");
        }
        await logActivity(`Completed task: ${task.title}`);
    } else {
        profile.xp = Math.max(0, profile.xp - task.xpReward);
        profile.coins = Math.max(0, profile.coins - task.coinReward);
        profile.completedTasks = Math.max(0, profile.completedTasks - 1);
        showToast(`Task uncompleted`, "info");
    }

    await db.profile.put(profile);

    // Check if completing this task unlocked any new achievements!
    if (newStatus) {
        await checkNewAchievements(oldProfileSnapshot, profile);
    }

    // Refresh pages
    renderHome();
    renderGoals();
    renderStatus();
    renderProfile();
}

async function deleteTask(taskId) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    await db.tasks.delete(taskId);
    showToast("Task deleted", "info");
    await logActivity(`Deleted task: ${task.title}`);

    renderHome();
    renderGoals();
    renderStatus();
}
// ======================
// GOALS
// ======================

// Place this helper function at the top level, ABOVE renderGoals()
const getCategoryMeta = (category) => {
    const cat = (category || "").toLowerCase();
    switch (cat) {
    case "work":
        return { icon: "badge", color: "#3b82f6" };
    case "study":
        return { icon: "school", color: "#8b5cf6" };
    case "learning":
        return { icon: "menu_book", color: "#84cc16" };
    case "fitness":
        return { icon: "fitness_center", color: "#f97316" }; // Gym / weightlifting
    case "running":
        return { icon: "directions_run", color: "#ea580c" }; // Stickman running
    case "cycling":
        return { icon: "directions_bike", color: "#c2410c" }; // Cycling
    case "yoga":
        return { icon: "self_improvement", color: "#14b8a6" }; // Stretching / yoga pose
    case "health":
        return { icon: "health_and_safety", color: "#10b981" };
    case "finance":
        return { icon: "account_balance_wallet", color: "#059669" };
    case "tech":
        return { icon: "code", color: "#0284c7" };
    case "mindfulness":
        return { icon: "spa", color: "#0d9488" };
    case "creative":
        return { icon: "brush", color: "#d946ef" };
    case "travel":
        return { icon: "explore", color: "#f59e0b" };
    case "home":
        return { icon: "house", color: "#65a30d" };
    case "shopping":
        return { icon: "local_mall", color: "#e11d48" };
    case "personal":
    default:
        return { icon: "account_circle", color: "#6b7280" };
}
};



async function renderGoals() {
    const container = document.getElementById("goals-container");
    if (!container) return;

    const goals = await db.goals.toArray();
    const tasks = await db.tasks.toArray();

    if (goals.length === 0) {
        container.innerHTML = `<div class="glass-card empty-state">No goals created yet. Tap 'New Goal' to begin!</div>`;
        return;
    }

    container.innerHTML = goals
        .map((goal) => {
            const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
            const completed = linkedTasks.filter((t) => t.status).length;
            const progress = linkedTasks.length > 0 ? Math.round((completed / linkedTasks.length) * 100) : 0;

            // Get icon and color based on the selected category
            const categoryMeta = getCategoryMeta(goal.category);

            return `
            <div class="goal-card glass-card">
                <div class="goal-header">
                    <div class="goal-title-area">
                        <h4>
                            <span class="material-symbols-outlined" style="color: ${categoryMeta.color};">${categoryMeta.icon}</span>
                            ${goal.title}
                        </h4>
                        <p>${goal.description || "No description provided."}</p>
                    </div>
                    <div class="task-actions">
                        <button onclick="openEditGoalModal('${goal.id}')"><span class="material-symbols-outlined" style="font-size:18px;">edit</span></button>
                        <button onclick="deleteGoal('${goal.id}')"><span class="material-symbols-outlined" style="font-size:18px;">delete</span></button>
                    </div>
                </div>
                <div class="goal-progress-section">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
                        <span>Progress (${completed}/${linkedTasks.length} Tasks)</span>
                        <span style="color: ${categoryMeta.color}; font-weight: 600;">${progress}%</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${progress}%; background: ${categoryMeta.color};"></div>
                    </div>
                </div>
                <div class="goal-footer">
                    <span>Deadline: ${goal.deadline || "None"}</span>
                </div>
            </div>
        `;
        })
        .join("");
    
    if (typeof toggleFAB === "function") toggleFAB(true);
}

async function deleteGoal(goalId) {
    await db.goals.delete(goalId);
    showToast("Goal deleted", "info");
    await logActivity(`Deleted goal`);
    renderGoals();
    renderHome();
}

// ======================
// STATUS
// ======================
async function renderStatus() {
    const profile = await db.profile.get(1);
    if (!profile) return;

    document.getElementById("status-total-xp").innerText = profile.xp;
    document.getElementById("status-total-coins").innerText = profile.coins;
    document.getElementById("status-streak").innerText = `${profile.streak} Days`;

    const tasks = await db.tasks.toArray();
    const completedTasksCount = tasks.filter((t) => t.status).length;
    document.getElementById("status-tasks-done").innerText = `${completedTasksCount}/${tasks.length}`;

    // Completion percentage mock/calculated calculations
    const dailyRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

    document.getElementById("chart-daily").style.width = `${dailyRate}%`;
    document.getElementById("text-chart-daily").innerText = `${dailyRate}%`;

    document.getElementById("chart-weekly").style.width = `${Math.min(100, dailyRate + 15)}%`;
    document.getElementById("text-chart-weekly").innerText = `${Math.min(100, dailyRate + 15)}%`;

    document.getElementById("chart-monthly").style.width = `${Math.min(100, dailyRate + 30)}%`;
    document.getElementById("text-chart-monthly").innerText = `${Math.min(100, dailyRate + 30)}%`;

    // -------------------------------------------------------------
    // DAILY TIME SPENT CHART LOGIC (Dexie + Last 7 Days)
    // -------------------------------------------------------------
    const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayName = daysOrder[d.getDay()];
        last7Days.push({ dateStr, dayName });
    }

    // Fetch daily stats from Dexie
    const allStats = await db.dailyStats.toArray();
    const statsMap = {};
    allStats.forEach((s) => {
        statsMap[s.date] = s.seconds;
    });

    // Include live active seconds for today
    const todayStr = getTodayDateString();
    if (typeof activeSecondsToday !== "undefined") {
        statsMap[todayStr] = activeSecondsToday;
    }

    const secondsArray = last7Days.map((d) => statsMap[d.dateStr] || 0);
    const maxSeconds = Math.max(...secondsArray, 60);

    const chartContainer = document.getElementById("daily-time-chart");
    if (chartContainer) {
        chartContainer.innerHTML = last7Days
            .map((d) => {
                const seconds = statsMap[d.dateStr] || 0;
                const percentage = Math.min(Math.round((seconds / maxSeconds) * 100), 100);
                const minutes = Math.floor(seconds / 60);
                const timeFormatted = minutes > 0 ? `${minutes}m` : `${seconds}s`;

                return `
                    <div class="chart-bar-column" title="${d.dayName} (${d.dateStr}): ${timeFormatted} active">
                        <span style="font-size: 9px; color: var(--text-muted);">${minutes > 0 ? timeFormatted : ""}</span>
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar-fill" style="height: ${percentage}%;"></div>
                        </div>
                        <span class="chart-bar-label">${d.dayName}</span>
                    </div>
                `;
            })
            .join("");
    }

    renderAchievements(profile);
    renderActivityLog();
    if (typeof toggleFAB === "function") toggleFAB(false);
}

async function renderAchievements(profile) {
    const container = document.getElementById("achievements-container");
    if (!container) return;

    const achievements = [
        { title: "First Step", desc: "Complete your first task", unlocked: profile.completedTasks >= 1, icon: "flag" },
        {
            title: "Streak Walker",
            desc: "Maintain a 3-day streak",
            unlocked: profile.streak >= 3,
            icon: "local_fire_department"
        },
        {
            title: "Momentum Builder",
            desc: "Complete 5 tasks",
            unlocked: profile.completedTasks >= 5,
            icon: "trending_up"
        },
        {
            title: "Task Master",
            desc: "Complete 10 tasks",
            unlocked: profile.completedTasks >= 10,
            icon: "military_tech"
        },
        {
            title: "Executioner",
            desc: "Complete 25 tasks",
            unlocked: profile.completedTasks >= 25,
            icon: "workspace_premium"
        },
        {
            title: "Legendary Achiever",
            desc: "Complete 50 tasks",
            unlocked: profile.completedTasks >= 50,
            icon: "verified"
        },
        {
            title: "Unstoppable Force",
            desc: "Maintain a 7-day streak",
            unlocked: profile.streak >= 7,
            icon: "whatshot"
        },
        {
            title: "Titan of Consistency",
            desc: "Maintain a 30-day streak",
            unlocked: profile.streak >= 30,
            icon: "auto_awesome"
        },
        { title: "High Roller", desc: "Earn 500 XP", unlocked: profile.xp >= 500, icon: "bolt" },
        { title: "XP Overdrive", desc: "Earn 1,500 XP", unlocked: profile.xp >= 1500, icon: "flash_on" },
        {
            title: "Coin Collector",
            desc: "Amass 250 total coins",
            unlocked: profile.coins >= 250,
            icon: "monetization_on"
        },
        { title: "Goal Crusher", desc: "Unlock Level 5 status", unlocked: profile.level >= 5, icon: "emoji_events" }
    ];

    container.innerHTML = achievements
        .map(
            (ach) => `
        <div class="achievement-card glass-card ${ach.unlocked ? "unlocked" : ""}">
            <span class="material-symbols-outlined achievement-icon text-primary">${ach.icon}</span>
            <div class="achievement-info">
                <h4>${ach.title}</h4>
                <p>${ach.desc}</p>
            </div>
        </div>
    `
        )
        .join("");
}

async function renderActivityLog() {
    const container = document.getElementById("activity-container");
    if (!container) return;

    const history = await db.history.reverse().limit(10).toArray();
    if (history.length === 0) {
        container.innerHTML = `<div class="empty-state">No recent activity logged.</div>`;
        return;
    }

    container.innerHTML = history
        .map(
            (item) => `
        <div class="activity-item">
            <span>${item.action}</span>
            <span class="activity-time">${item.timestamp}</span>
        </div>
    `
        )
        .join("");
}

// ======================
// PROFILE
// ======================
async function renderProfile() {
    const profile = await db.profile.get(1);
    if (!profile) return;

    document.getElementById("profile-display-name").innerText = profile.username;
    document.getElementById("profile-display-bio").innerText = profile.bio;
    document.getElementById("profile-badge-level").innerText = `Level ${profile.level}`;
    document.getElementById("profile-badge-joindate").innerText = `Joined ${profile.joinDate}`;

    // Handle avatar display (custom uploaded image/Base64 or default Material icon)
    const avatarImg = document.getElementById("profile-avatar-img");
    if (profile.avatarUrl) {
        avatarImg.src = profile.avatarUrl;
        avatarImg.style.objectFit = "cover";
    } else {
        // Default clean icon fallback representation if no custom image is uploaded
        avatarImg.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" fill="%236366f1"><path d="M24 24c-3.85 0-7-3.15-7-7s3.15-7 7-7 7 3.15 7 7-3.15 7-7 7Zm0 3c4.97 0 10 2.48 10 7.42V38H14v-3.58C14 29.48 19.03 27 24 27Z"/></svg>`;
        avatarImg.style.objectFit = "contain";
        avatarImg.style.padding = "10px";
    }

    document.getElementById("input-username").value = profile.username;
    document.getElementById("input-bio").value = profile.bio;
    document.getElementById("input-age").value = profile.age || "";
    document.getElementById("input-gender").value = profile.gender || "Prefer not to say";
    document.getElementById("input-country").value = profile.country || "";
    document.getElementById("input-occupation").value = profile.occupation || "";

    const settings = await db.settings.get(1);
    if (settings) {
        document.getElementById("setting-dark-mode").checked = settings.darkMode;
        document.getElementById("setting-notifications").checked = settings.notifications;
    }
    
    if (typeof toggleFAB === "function") toggleFAB(false);
}

// ======================
// AVATAR UPLOAD HANDLER
// ======================
function initAvatarHandler() {
    const changeAvatarBtn = document.getElementById("change-avatar-btn");
    if (!changeAvatarBtn) return;

    // Ensure hidden file input exists
    let fileInput = document.getElementById("hidden-avatar-file-input");
    if (!fileInput) {
        fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "hidden-avatar-file-input";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);

        // Single file change event listener
        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                showToast("Image size should be less than 2MB", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = async function (uploadEvent) {
                const base64Image = uploadEvent.target.result;
                const profile = await db.profile.get(1);
                if (profile) {
                    profile.avatarUrl = base64Image;
                    await db.profile.put(profile);
                    renderProfile();
                    showToast("Profile picture updated successfully!", "success");
                }
            };
            reader.readAsDataURL(file);

            // Reset input value so re-uploading the same file triggers change
            fileInput.value = "";
        });
    }

    // Assign onclick directly to avoid attaching duplicate event listeners
    changeAvatarBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    };
} // ======================
// MODALS & FORMS
// ======================
function initModals() {
    const taskModal = document.getElementById("task-modal");
    const goalModal = document.getElementById("goal-modal");
    const searchModal = document.getElementById("search-modal");

    document.getElementById("fab-add-task").addEventListener("click", async () => {
        document.getElementById("task-form").reset();
        document.getElementById("task-id").value = "";
        document.getElementById("task-modal-title").innerText = "Create New Task";
        await populateGoalDropdown();
        taskModal.classList.add("active");
    });

    document.getElementById("open-add-goal-modal")?.addEventListener("click", () => {
        document.getElementById("goal-form").reset();
        document.getElementById("goal-id").value = "";
        document.getElementById("goal-modal-title").innerText = "Create New Goal";
        goalModal.classList.add("active");
    });

    document.getElementById("global-search-btn").addEventListener("click", () => {
        searchModal.classList.add("active");
        document.getElementById("global-search-input").focus();
    });

    document.querySelectorAll(".close-modal").forEach((btn) => {
        btn.addEventListener("click", () => {
            taskModal.classList.remove("active");
            goalModal.classList.remove("active");
            searchModal.classList.remove("active");
        });
    });
}

async function populateGoalDropdown(selectedGoalId = "") {
    const select = document.getElementById("task-goal");
    const goals = await db.goals.toArray();

    select.innerHTML =
        `<option value="">None</option>` +
        goals
            .map(
                (g) => `
        <option value="${g.id}" ${g.id === selectedGoalId ? "selected" : ""}>${g.title}</option>
    `
            )
            .join("");
}

function initForms() {
    // Task Form Submit
    const taskForm = document.getElementById("task-form");
    if (!taskForm) return;

    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const idField = document.getElementById("task-id").value;
        const title = document.getElementById("task-title").value.trim();

        if (!title) {
            showToast("Task title cannot be empty!", "error");
            return;
        }

        const difficulty = document.getElementById("task-difficulty").value;
        let xpReward = 30;
        if (difficulty === "Easy") xpReward = 15;
        if (difficulty === "Hard") xpReward = 50;
        if (difficulty === "Expert") xpReward = 100;

        const taskId = idField || "task_" + Date.now();

        const taskData = {
            id: taskId,
            title,
            description: document.getElementById("task-desc").value,
            goalId: document.getElementById("task-goal").value,
            category: document.getElementById("task-category").value,
            difficulty,
            priority: document.getElementById("task-priority").value,
            xpReward,
            coinReward: Math.round(xpReward / 2),
            deadline: document.getElementById("task-deadline").value || getTodayDateString(),
            repeat: document.getElementById("task-repeat").value,
            status: false,
            notes: document.getElementById("task-notes").value
        };

        if (idField) {
            await db.tasks.put(taskData);
            showToast("Task updated successfully!", "success");
        } else {
            await db.tasks.add(taskData);
            showToast("Task created successfully!", "success");
            await logActivity(`Created task: ${title}`);
        }

        document.getElementById("task-modal").classList.remove("active");
        taskForm.reset();
        document.getElementById("task-id").value = ""; 

        const activeChip = document.querySelector(".filter-chips .chip.active");
        const currentFilter = activeChip ? activeChip.getAttribute("data-filter") : "today";

        await renderHome(currentFilter);
        await renderGoals();
        await renderStatus();

        if (typeof toggleFAB === "function") {
            toggleFAB(true);
        }
    });
}
    // Goal Form Submit
    document.getElementById("goal-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const idField = document.getElementById("goal-id").value;
        const title = document.getElementById("goal-title").value.trim();

        if (!title) {
            showToast("Goal title cannot be empty!", "error");
            return;
        }

        const goalData = {
            id: idField || "goal_" + Date.now(),
            title,
            description: document.getElementById("goal-desc").value,
            deadline: document.getElementById("goal-deadline").value,
            category: document.getElementById("goal-category").value // <--- Saved category here
        };

        if (idField) {
            await db.goals.update(idField, goalData);
            showToast("Goal updated successfully!", "success");
        } else {
            await db.goals.put(goalData);
            showToast("Goal created successfully!", "success");
            await logActivity(`Created goal: ${title}`);
        }

        document.getElementById("goal-modal").classList.remove("active");
        renderGoals();
        renderHome();
    });

    // Profile Form Submit
    document.getElementById("profile-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const profile = await db.profile.get(1);

        profile.username = document.getElementById("input-username").value;
        profile.bio = document.getElementById("input-bio").value;
        profile.age = parseInt(document.getElementById("input-age").value) || profile.age;
        profile.gender = document.getElementById("input-gender").value;
        profile.country = document.getElementById("input-country").value;
        profile.occupation = document.getElementById("input-occupation").value;

        await db.profile.put(profile);
        showToast("Profile updated successfully!", "success");
        renderHome();
        renderProfile();
    });

    // Global Search Live Typing
    document.getElementById("global-search-input").addEventListener("input", async (e) => {
        const query = e.target.value.toLowerCase();
        const container = document.getElementById("search-results-container");

        if (!query) {
            container.innerHTML = "";
            return;
        }

        const tasks = await db.tasks
            .filter((t) => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query))
            .toArray();

        if (tasks.length === 0) {
            container.innerHTML = `<div class="empty-state">No matching tasks found.</div>`;
            return;
        }

        container.innerHTML = tasks
            .map(
                (task) => `
            <div class="task-card glass-card">
                <div class="task-left">
                    <div class="task-info">
                        <span class="task-title">${task.title}</span>
                        <div class="task-meta"><span>${task.category}</span> • <span>${task.deadline || "No deadline"}</span></div>
                    </div>
                </div>
            </div>
        `
            )
            .join("");
    });

    // Add this helper function to handle event propagation properly for all modals
    function setupModalSelectFix() {
        const selects = document.querySelectorAll("select");
        selects.forEach((select) => {
            select.addEventListener("mousedown", (e) => {
                e.stopPropagation();
            });
            select.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        });
    

    // Call this inside your initForms or when modals open
}

async function openEditTaskModal(taskId) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    document.getElementById("task-id").value = task.id;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.description || "";
    document.getElementById("task-category").value = task.category;
    document.getElementById("task-difficulty").value = task.difficulty;
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-deadline").value = task.deadline || "";
    document.getElementById("task-repeat").value = task.repeat;
    document.getElementById("task-notes").value = task.notes || "";

    await populateGoalDropdown(task.goalId);
    document.getElementById("task-modal-title").innerText = "Edit Task";
    document.getElementById("task-modal").classList.add("active");
}

async function openEditGoalModal(goalId) {
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    document.getElementById("goal-id").value = goal.id;
    document.getElementById("goal-title").value = goal.title;
    document.getElementById("goal-desc").value = goal.description || "";
    document.getElementById("goal-deadline").value = goal.deadline || "";
    document.getElementById("goal-category").value = goal.category || "Personal"; // <--- Pre-selects category

    document.getElementById("goal-modal-title").innerText = "Edit Goal";
    document.getElementById("goal-modal").classList.add("active");
}
// ======================
// THEME HANDLING
// ======================
function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle-btn");
    const checkboxToggle = document.getElementById("setting-dark-mode");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", async () => {
            const html = document.documentElement;
            const isDark = !html.classList.contains("dark");
            applyTheme(isDark);

            const settings = await db.settings.get(1);
            if (settings) {
                settings.darkMode = isDark;
                await db.settings.put(settings);
            }
        });
    }

    if (checkboxToggle) {
        checkboxToggle.addEventListener("change", async (e) => {
            const isDark = e.target.checked;
            applyTheme(isDark);

            const settings = await db.settings.get(1);
            if (settings) {
                settings.darkMode = isDark;
                await db.settings.put(settings);
            }
        });
    }
}

function applyTheme(isDark) {
    const html = document.documentElement;
    const checkboxToggle = document.getElementById("setting-dark-mode");
    const icon = document.getElementById("theme-icon");

    if (isDark) {
        html.classList.add("dark");
        if (icon) icon.innerText = "dark_mode";
        if (checkboxToggle) checkboxToggle.checked = true;
    } else {
        html.classList.remove("dark");
        if (icon) icon.innerText = "light_mode";
        if (checkboxToggle) checkboxToggle.checked = false;
    }
}

// Run application on load
window.addEventListener("DOMContentLoaded", initApp);
// ======================
// DELETE ALL DATA HANDLER
// ======================
function initDangerZone() {
    const deleteBtn = document.getElementById("delete-all-data-btn");
    if (!deleteBtn) return;

    // Prevent attaching multiple click listeners when initDangerZone() runs more than once
    if (deleteBtn.dataset.bound === "true") return;
    deleteBtn.dataset.bound = "true";

    deleteBtn.addEventListener("click", async () => {
        // Trigger your custom styled modal instead of window.confirm
        const confirmed = await showCustomConfirm({
            title: "Are you sure?",
            description: "This action cannot be undone and will reset all tasks, goals, and profile stats.",
            confirmText: "Yes, Delete All",
            isDanger: true
        });

        if (!confirmed) return;

        try {
            // Clear all tables within the single ImproveXDB database
            await db.transaction(
                "rw",
                db.profile,
                db.tasks,
                db.goals,
                db.habits,
                db.dailyStats,
                db.history,
                db.settings,
                async () => {
                    await db.profile.clear();
                    await db.tasks.clear();
                    await db.goals.clear();
                    await db.habits.clear();
                    await db.dailyStats.clear();
                    await db.history.clear();
                    await db.settings.clear();
                }
            );

            showToast("All data successfully wiped. Re-initializing...", "error");

            // Hard reload the window instead of calling initApp() manually. 
            // This completely flushes JS memory state, preventing duplication bugs and stale event listeners.
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error("Failed to delete database records:", error);
            showToast("Error clearing application data.", "error");
        }
    });
}
// Global tracking variables
let activeSecondsToday = 0;
let isTabActive = true;

// Track active seconds every second and save to Dexie
setInterval(async () => {
    if (isTabActive) {
        activeSecondsToday += 1;
        const todayStr = getTodayDateString(); // e.g., "2026-06-06"

        // Save to Dexie every 10 seconds to optimize performance
        if (activeSecondsToday % 10 === 0) {
            await db.dailyStats.put({ date: todayStr, seconds: activeSecondsToday });
        }
    }
}, 1000);

// Pause tracking if user switches tabs or minimizes app
document.addEventListener("visibilitychange", () => {
    isTabActive = !document.hidden;
});

// Load today's initial seconds from Dexie on startup
async function initDailyTimeTracker() {
    const todayStr = getTodayDateString();
    const record = await db.dailyStats.get(todayStr);
    if (record) {
        activeSecondsToday = record.seconds;
    }
}

// Call initDailyTimeTracker() inside your initApp() function!

//////////////////////pop up/////////////////////////
// Keep track of previously unlocked achievements in memory or check against Dexie history
async function checkNewAchievements(oldProfile, newProfile) {
    // Define all achievements with their unlock conditions
    const achievements = [
        {
            id: "first_step",
            title: "First Step",
            desc: "Complete your first task",
            unlocked: (p) => p.completedTasks >= 1,
            icon: "flag"
        },
        {
            id: "streak_walker",
            title: "Streak Walker",
            desc: "Maintain a 3-day streak",
            unlocked: (p) => p.streak >= 3,
            icon: "local_fire_department"
        },
        {
            id: "momentum_builder",
            title: "Momentum Builder",
            desc: "Complete 5 tasks",
            unlocked: (p) => p.completedTasks >= 5,
            icon: "trending_up"
        },
        {
            id: "task_master",
            title: "Task Master",
            desc: "Complete 10 tasks",
            unlocked: (p) => p.completedTasks >= 10,
            icon: "military_tech"
        },
        {
            id: "executioner",
            title: "Executioner",
            desc: "Complete 25 tasks",
            unlocked: (p) => p.completedTasks >= 25,
            icon: "workspace_premium"
        },
        {
            id: "legendary_achiever",
            title: "Legendary Achiever",
            desc: "Complete 50 tasks",
            unlocked: (p) => p.completedTasks >= 50,
            icon: "verified"
        },
        {
            id: "unstoppable_force",
            title: "Unstoppable Force",
            desc: "Maintain a 7-day streak",
            unlocked: (p) => p.streak >= 7,
            icon: "whatshot"
        },
        {
            id: "titan_consistency",
            title: "Titan of Consistency",
            desc: "Maintain a 30-day streak",
            unlocked: (p) => p.streak >= 30,
            icon: "auto_awesome"
        },
        { id: "high_roller", title: "High Roller", desc: "Earn 500 XP", unlocked: (p) => p.xp >= 500, icon: "bolt" },
        {
            id: "xp_overdrive",
            title: "XP Overdrive",
            desc: "Earn 1,500 XP",
            unlocked: (p) => p.xp >= 1500,
            icon: "flash_on"
        },
        {
            id: "coin_collector",
            title: "Coin Collector",
            desc: "Amass 250 total coins",
            unlocked: (p) => p.coins >= 250,
            icon: "monetization_on"
        },
        {
            id: "goal_crusher",
            title: "Goal Crusher",
            desc: "Unlock Level 5 status",
            unlocked: (p) => p.level >= 5,
            icon: "emoji_events"
        }
    ];

    for (const ach of achievements) {
        const wasUnlockedBefore = ach.unlocked(oldProfile);
        const isUnlockedNow = ach.unlocked(newProfile);

        // If it wasn't unlocked before, but is unlocked now, CONGRATULATE!
        if (!wasUnlockedBefore && isUnlockedNow) {
            showAchievementPopup(ach);
            await logActivity(`Unlocked Achievement: ${ach.title}`);
        }
    }
}

function showAchievementPopup(ach) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const popup = document.createElement("div");
    // Add a custom CSS class or distinct styling for achievements
    popup.className = `toast achievement-toast`;
    popup.style.cssText = `
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
        border: 1px solid rgba(16, 185, 129, 0.4);
        backdrop-filter: blur(12px);
        padding: 12px 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    popup.innerHTML = `
        <div style="background: var(--text-main); color: var(--bg-main); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 20px;">${ach.icon}</span>
        </div>
        <div>
            <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #10b981; letter-spacing: 0.05em;">Achievement Unlocked!</div>
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${ach.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${ach.desc}</div>
        </div>
    `;

    container.appendChild(popup);

    // Remove after 4.5 seconds
    setTimeout(() => {
        popup.style.animation = "fadeOut 0.3s ease forwards";
        setTimeout(() => popup.remove(), 300);
    }, 4500);
}

////////////////////////////delete all data pop up code//////////////////////////////////

function showCustomConfirm({ title, description, confirmText = "Confirm", isDanger = true }) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("custom-confirm-modal");
        const titleEl = document.getElementById("custom-modal-title");
        const descEl = document.getElementById("custom-modal-desc");
        const confirmBtn = document.getElementById("custom-modal-confirm");
        const cancelBtn = document.getElementById("custom-modal-cancel");
        const iconWrapper = document.getElementById("custom-modal-icon-bg");
        const iconEl = document.getElementById("custom-modal-icon");

        if (!overlay) return resolve(false);

        titleEl.innerText = title;
        descEl.innerText = description;
        confirmBtn.innerText = confirmText;

        if (isDanger) {
            iconWrapper.style.background = "rgba(252, 252, 252, 0.15)";
            iconWrapper.style.color = "#ef4444";
            iconEl.innerText = "warning";
            confirmBtn.style.background = "#ef4444";
        } else {
            iconWrapper.style.background = "rgba(59, 130, 246, 0.15)";
            iconWrapper.style.color = "#3b82f6";
            iconEl.innerText = "info";
            confirmBtn.style.background = "#3b82f6";
        }

        overlay.style.display = "flex";
        setTimeout(() => overlay.classList.add("active"), 10);

        const cleanup = (result) => {
            overlay.classList.remove("active");
            setTimeout(() => {
                overlay.style.display = "none";
            }, 250);
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            overlay.onclick = null;
            resolve(result);
        };

        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
        overlay.onclick = (e) => {
            if (e.target === overlay) cleanup(false);
        };
    });
}

const motivationQuotes = [
    { title: "Time to Improve! ⚡", body: "“Discipline is choosing between what you want now and what you want most.”" },
    { title: "Crush Your Goals 🎯", body: "“Small progress each day adds up to big results.”" },
    { title: "Stay Focused 🚀", body: "“Action is the foundational key to all success.” – Pablo Picasso" },
    { title: "Level Up Your Day 🔥", body: "“Don't watch the clock; do what it does. Keep going.” – Sam Levenson" },
    { title: "Build Your Momentum 💡", body: "“The secret of getting ahead is getting started.” – Mark Twain" },
    { title: "Consistency is King 👑", body: "“We are what we repeatedly do. Excellence, then, is not an act, but a habit.”" }
];

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
    return motivationQuotes[randomIndex];
}
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }
    return false;
}

async function sendSystemNotification(title, body) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
            body: body
        });
    } else {
        new Notification(title, {
            body: body
        });
    }
}

//////////////////////////////////////////////////


let currentOnboardStep = 1;
const totalOnboardSteps = 3;

// Check on app load if user profile already exists in Dexie using 'profile'
document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (!db.isOpen()) {
            await db.open();
        }
        const profileCount = await db.profile.count();
        if (profileCount === 0) {
            document.getElementById("app-onboarding").style.display = "flex";
        }
    } catch (e) {
        console.error("Dexie onboarding check error:", e);
        if (!localStorage.getItem("improvex_onboarded")) {
            document.getElementById("app-onboarding").style.display = "flex";
        }
    }
});

function updateOnboardingUI() {
    // Update active steps
    document.querySelectorAll(".onboarding-step").forEach((stepEl) => {
        const stepNum = parseInt(stepEl.getAttribute("data-step"));
        if (stepNum === currentOnboardStep) {
            stepEl.classList.add("active");
        } else {
            stepEl.classList.remove("active");
        }
    });

    // Update progress dots
    document.querySelectorAll(".onboarding-dots .dot").forEach((dotEl) => {
        const dotStep = parseInt(dotEl.getAttribute("data-dot") || dotEl.getAttribute("data-step"));
        if (dotStep === currentOnboardStep) {
            dotEl.classList.add("active");
        } else {
            dotEl.classList.remove("active");
        }
    });

    // Toggle Back button visibility
    const prevBtn = document.getElementById("onboard-prev-btn");
    const nextBtn = document.getElementById("onboard-next-btn");
    
    if (currentOnboardStep === 1) {
        prevBtn.style.display = "none";
    } else {
        prevBtn.style.display = "block";
    }

    if (currentOnboardStep === totalOnboardSteps) {
        nextBtn.textContent = "Get Started";
    } else {
        nextBtn.textContent = "Continue";
    }
}

function nextOnboardingStep() {
    // Validate Step 2 inputs if user is on step 2
    if (currentOnboardStep === 2) {
        const name = document.getElementById("onboard-name").value.trim();
        const age = document.getElementById("onboard-age").value.trim();
        const occupation = document.getElementById("onboard-occupation").value.trim();

        if (!name || !age || !occupation) {
            alert("Please fill in all fields to continue your journey!");
            return;
        }
    }

    if (currentOnboardStep < totalOnboardSteps) {
        currentOnboardStep++;
        updateOnboardingUI();
    } else {
        // Final step: Save profile into Dexie and close modal
        finishOnboarding();
    }
}

function prevOnboardingStep() {
    if (currentOnboardStep > 1) {
        currentOnboardStep--;
        updateOnboardingUI();
    }
}

async function finishOnboarding() {
    const name = document.getElementById("onboard-name").value.trim();
    const age = parseInt(document.getElementById("onboard-age").value.trim()) || 0;
    const occupation = document.getElementById("onboard-occupation").value.trim();

    const joinDateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const userProfileData = {
        id: 1, 
        username: name,
        age: age,
        occupation: occupation,
        bio: "Ready to level up and conquer my goals!",
        level: 1,
        xp: 0,
        coins: 0,
        streak: 0,
        completedTasks: 0,
        goalsCount: 0,
        joinDate: joinDateStr,
        gender: "Prefer not to say",
        country: "",
        avatarUrl: "",
        createdAt: new Date().toISOString()
    };

    try {
        await db.profile.put(userProfileData);
        localStorage.setItem("improvex_onboarded", "true");
    } catch (e) {
        console.error("Error saving user profile to Dexie:", e);
        localStorage.setItem("improvex_onboarded", "true");
    }

    if (typeof renderProfile === "function") {
        await renderProfile();
    }

    const overlay = document.getElementById("app-onboarding");
    overlay.style.transition = "opacity 0.4s ease";
    overlay.style.opacity = "0";
    setTimeout(() => {
        overlay.style.display = "none";
        if (typeof renderHome === "function") renderHome();
    }, 400);
}
/////////////////////////////////////////////////////////////


let touchStartY = 0;
let pullDistance = 0;
const pullThreshold = 80; // Distance required in pixels to trigger refresh
const indicator = document.getElementById("pull-refresh-indicator");

window.addEventListener("touchstart", (e) => {
    // Only allow pull-to-refresh if the user is scrolled all the way to the top of the page
    if (window.scrollY <= 0) {
        touchStartY = e.touches[0].clientY;
    } else {
        touchStartY = 0;
    }
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    if (touchStartY === 0) return;

    const currentY = e.touches[0].clientY;
    pullDistance = currentY - touchStartY;

    if (pullDistance > 0 && pullDistance < 200) {
        // Smooth resistance curve as user pulls down
        const translation = pullDistance * 0.4;
        indicator.style.transform = `translateY(${translation}px)`;
        
        // Spin the icon progressively based on pull distance
        const spinnerIcon = indicator.querySelector(".pull-refresh-spinner span");
        if (spinnerIcon) {
            spinnerIcon.style.transform = `rotate(${pullDistance * 2}deg)`;
        }
    }
}, { passive: true });

window.addEventListener("touchend", () => {
    if (touchStartY === 0) return;

    if (pullDistance >= pullThreshold) {
        // Trigger Refresh state
        document.body.classList.add("is-refreshing");
        indicator.style.transform = `translateY(70px)`;

        // Simulate or execute refresh action (Reloads page or re-fetches UI state safely)
        setTimeout(() => {
            window.location.reload();
        }, 800);
    } else {
        // Snap back smoothly if pull wasn't far enough
        indicator.style.transform = `translateY(0px)`;
    }

    touchStartY = 0;
    pullDistance = 0;
});




/////////////////////////////////////////////////////////////////////////////////////


// Helper to determine the current time slot based on the user's local clock
// Helper to determine the granular current time slot based on the local clock
function getCurrentTimeSlot() {
    const hour = new Date().getHours();
    
    if (hour >= 4 && hour < 7) return "early-morning";     // 4:00 AM – 7:00 AM
    if (hour >= 7 && hour < 9) return "late-morning";      // 7:00 AM – 9:00 AM
    if (hour >= 9 && hour < 12) return "mid-morning";      // 9:00 AM – 12:00 PM
    if (hour >= 12 && hour < 15) return "early-afternoon"; // 12:00 PM – 3:00 PM
    if (hour >= 15 && hour < 18) return "late-afternoon";  // 3:00 PM – 6:00 PM
    if (hour >= 18 && hour < 21) return "evening";         // 6:00 PM – 9:00 PM
    if (hour >= 21 && hour < 23) return "night";           // 9:00 PM – 11:00 PM
    return "late-night";                                   // 11:00 PM – 4:00 AM
}

// ==========================================
// OFFLINE ICON HELPER FUNCTION
// ==========================================
function getOfflineTimeBlockIcon(iconName, customClass = "") {
    const icons = {
        sunrise: `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v6m-7.07-2.93l4.24 4.24M2 12h6m12 0h6m-4.93-7.07l-4.24 4.24M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM2 20h20"></path></svg>`,
        coffee: `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"></path></svg>`,
        briefcase: `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
        sun: `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        zap: `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        sunset: `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 10V2M4.93 10.93l4.24 4.24M2 18h20M6 14H2m20 0h-4m-7.07 3.07l-4.24-4.24"></path></svg>`,
        moon: `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
        "cloud-moon": `<svg class="${customClass}" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M13 16a3 3 0 1 0 0-6M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`
    };
    return icons[iconName] || icons.sun;
}

// ==========================================
// RENDER FUNCTION
// ==========================================
// Function to render the time-blocked section on your home page
async function renderTimeBlockedTasks() {
    const container = document.getElementById("time-blocked-tasks-container");
    if (!container) return;

    const currentTimeSlot = getCurrentTimeSlot();
    const tasks = await db.tasks.toArray();
    
    // Filter tasks for the active time slot today
    const todayStr = getTodayDateString();
    const activeTasks = tasks.filter(task => 
        task.deadline === todayStr && task.timeSlot === currentTimeSlot
    );

    // Map each time slot to its Google Material Symbol name and title label
    const slotConfigMap = {
        "early-morning": { icon: "wb_twilight", label: "Early Morning Routine (4:00 AM – 7:00 AM)" },
        "late-morning": { icon: "coffee", label: "Breakfast & Prep (7:00 AM – 9:00 AM)" },
        "mid-morning": { icon: "work", label: "Mid-Morning Focus (9:00 AM – 12:00 PM)" },
        "early-afternoon": { icon: "wb_sunny", label: "Early Afternoon Block (12:00 PM – 3:00 PM)" },
        "late-afternoon": { icon: "bolt", label: "Late Afternoon Push (3:00 PM – 6:00 PM)" },
        "evening": { icon: "wb_shade", label: "Evening Wind Down (6:00 PM – 9:00 PM)" },
        "night": { icon: "bedtime", label: "Night Routine (9:00 PM – 11:00 PM)" },
        "late-night": { icon: "nightlight", label: "Late Night Rest (11:00 PM – 4:00 AM)" }
    };

    const currentConfig = slotConfigMap[currentTimeSlot] || { icon: "schedule", label: "Current Time Block" };

    // Category configuration map for individual tasks
    const categoryConfig = {
        Fitness: { icon: "fitness_center", color: "#f97316" },
        Running: { icon: "directions_run", color: "#ea580c" },
        Cycling: { icon: "directions_bike", color: "#c2410c" },
        Yoga: { icon: "self_improvement", color: "#14b8a6" },
        Health: { icon: "health_and_safety", color: "#10b981" },
        Work: { icon: "badge", color: "#3b82f6" },
        Learning: { icon: "menu_book", color: "#84cc16" },
        Study: { icon: "school", color: "#8b5cf6" },
        Personal: { icon: "account_circle", color: "#ec4899" },
        Finance: { icon: "account_balance_wallet", color: "#059669" },
        Tech: { icon: "code", color: "#0284c7" },
        Mindfulness: { icon: "spa", color: "#0d9488" },
        Creative: { icon: "brush", color: "#d946ef" },
        Travel: { icon: "explore", color: "#f59e0b" },
        Home: { icon: "house", color: "#65a30d" },
        Shopping: { icon: "local_mall", color: "#e11d48" },
        Default: { icon: "task_alt", color: "#6b7280" }
    };

    let html = `
        <div class="time-block-section">
            <h3>
                <span class="material-symbols-outlined" style="font-size: 24px; vertical-align: middle;">${currentConfig.icon}</span>
                ${currentConfig.label}
            </h3>
    `;

    if (activeTasks.length === 0) {
        html += `<p class="no-tasks-msg">All caught up for this time block! Great job! 🎉</p>`;
    } else {
        html += `<ul class="task-list">`;
        activeTasks.forEach(task => {
            const config = categoryConfig[task.category] || categoryConfig.Default;
            // Larger, bolder icon styling
            const iconStyle = `font-size: 30px; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${config.color};`;
            
            // Custom bigger checkbox styling matching your main task view card
            const checkboxStyle = `width: 32px; height: 22px; border-radius: 6px; border: 2px solid var(--border-color, #cbd5e1); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; background: ${task.status ? 'var(--success-color, #10b981)' : 'transparent'};`;
            html += `
                <li class="task-item ${task.status ? 'completed' : ''}">
                    <div class="task-item-content" style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" ${task.status ? 'checked' : ''} onchange="toggleTaskStatus('${task.id}')">
                        <span class="material-symbols-outlined" style="${iconStyle}">${config.icon}</span>
                        <span>${task.title}</span>
                    </div>
                    <span class="task-reward-badge">+${task.xpReward} XP</span>
                </li>
            `;
        });
        html += `</ul>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}
