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
            country: "United States",
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
        // Goal 1: Fitness & Health
        const goal1Id = "goal_" + Date.now();
        await db.goals.put({
            id: goal1Id,
            title: "Marathon Preparation & Peak Fitness",
            description: "Build endurance, strength, and healthy daily habits to run a full 42k marathon.",
            deadline: "2026-11-30",
            color: "#10b981"
        });

        // Goal 2: Professional / Tech
        const goal2Id = "goal_" + (Date.now() + 1);
        await db.goals.put({
            id: goal2Id,
            title: "Master Fullstack System Architecture",
            description: "Deep dive into advanced scalable microservices, cloud deployments, and clean code practices.",
            deadline: "2026-12-31",
            color: "#6366f1"
        });

        // Goal 3: Personal Growth
        const goal3Id = "goal_" + (Date.now() + 2);
        await db.goals.put({
            id: goal3Id,
            title: "Expand Mindset & Global Knowledge",
            description: "Read 12 transformative books and build a consistent journaling routine.",
            deadline: "2026-12-15",
            color: "#ec4899"
        });

        // Associated Starter Tasks (Using dynamic unique timestamps for IDs to prevent primary key collisions on resets)
        await db.tasks.bulkPut([
            {
                id: "task_" + Date.now() + "_1",
                title: "Morning 5km Cardio Run",
                description: "Keep pace steady and maintain a consistent heart rate zone.",
                goalId: goal1Id,
                category: "Fitness",
                difficulty: "Medium",
                priority: "High",
                xpReward: 30,
                coinReward: 15,
                deadline: getTodayDateString(),
                repeat: "Daily",
                status: false,
                notes: "Remember dynamic stretching beforehand"
            },
            {
                id: "task_" + Date.now() + "_2",
                title: "Core Strength & Mobility Workout",
                description: "Focus on planks, kettlebell swings, and lower back stability.",
                goalId: goal1Id,
                category: "Health",
                difficulty: "Easy",
                priority: "Medium",
                xpReward: 15,
                coinReward: 7,
                deadline: getTodayDateString(),
                repeat: "None",
                status: false,
                notes: "3 sets x 45 seconds each"
            },
            {
                id: "task_" + Date.now() + "_3",
                title: "Refactor Database Indexing & Queries",
                description: "Optimize backend schemas and inspect slow query logs for performance bottlenecks.",
                goalId: goal2Id,
                category: "Work",
                difficulty: "Hard",
                priority: "Urgent",
                xpReward: 50,
                coinReward: 25,
                deadline: getTodayDateString(),
                repeat: "None",
                status: false,
                notes: "Check execution plans and add composite indexes"
            },
            {
                id: "task_" + Date.now() + "_4",
                title: "System Design Architecture Study",
                description: "Review distributed caching strategies using Redis and CDN edge routing.",
                goalId: goal2Id,
                category: "Study",
                difficulty: "Expert",
                priority: "High",
                xpReward: 100,
                coinReward: 50,
                deadline: getTodayDateString(),
                repeat: "Weekly",
                status: false,
                notes: "Draft diagrams on whiteboarding tool"
            },
            {
                id: "task_" + Date.now() + "_5",
                title: "Read 30 Pages of 'Atomic Habits'",
                description: "Absorb practical insights on habit stacking and environmental design.",
                goalId: goal3Id,
                category: "Personal",
                difficulty: "Easy",
                priority: "Medium",
                xpReward: 15,
                coinReward: 8,
                deadline: getTodayDateString(),
                repeat: "Daily",
                status: false,
                notes: "Highlight key takeaways in notebook"
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

    // Dynamic hourly greeting logic
    const currentHour = new Date().getHours();
    let greeting = "Hello there!";

    const hourlyGreetings = {
        4: "Early bird mode activated! Let's get things rolling",
        5: "Rise and shine! Ready to conquer the day?",
        6: "How's the morning going? Let's make it productive",
        7: "Good morning! Grab a coffee and let's dive in",
        8: "Morning energy is high! What's the main focus today?",
        9: "Hope your morning is off to a flying start!",
        10: "Mid-morning check-in—how are things tracking?",
        11: "Almost lunchtime! Let's finish these tasks strong",
        12: "It's noon! Take a breather and reset for the afternoon",
        13: "How's the afternoon treating you so far?",
        14: "Afternoon slump? Let's crush a quick task to bounce back",
        15: "Keep up the momentum! You're doing great",
        16: "Late afternoon push—let's wrap up strong",
        17: "Evening is rolling in. How did today go?",
        18: "Wind down or push through? You've got this",
        19: "Hope you're having a relaxing evening!",
        20: "Evening vibes. Time to review or unwind?",
        21: "Wrapping up the day? Pat yourself on the back",
        22: "Night owl mode. Keep it chill and restorative",
        23: "Getting late! Time to start winding down",
        0: "Burning the midnight oil, aren't we?",
        1: "Late night focus. Don't forget to rest soon!",
        2: "Quiet hours. Hope you're resting well",
        3: "The world is asleep. Sweet dreams!"
    };

    greeting = hourlyGreetings[currentHour] || "Have a great day ahead!";

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
        Fitness: { icon: "fitness_center", color: "#f97316" },
        Health: { icon: "local_hospital", color: "#10b981" },
        Work: { icon: "work", color: "#3b82f6" },
        Learning: { icon: "school", color: "#beff0a" },
        Study: { icon: "book", color: "#8b5cf6" },
        Personal: { icon: "person", color: "#ec4899" },
        Finance: { icon: "payments", color: "#059669" },
        Tech: { icon: "terminal", color: "#0284c7" },
        Mindfulness: { icon: "self_improvement", color: "#14b8a6" },
        Creative: { icon: "palette", color: "#d946ef" },
        Travel: { icon: "flight", color: "#f59e0b" },
        Home: { icon: "home", color: "#84cc16" },
        Shopping: { icon: "shopping_cart", color: "#e11d48" },
        Default: { icon: "task_alt", color: "#6b7280" }
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

    if (newStatus) {
        profile.xp += task.xpReward;
        profile.coins += task.coinReward;
        profile.completedTasks += 1;

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
            return { icon: "work", color: "#0ea5e9" };
        case "study":
            return { icon: "menu_book", color: "#8b5cf6" };
        case "fitness":
            return { icon: "directions_run", color: "#f97316" };
        case "health":
            return { icon: "favorite", color: "#ef4444" };
        case "finance":
            return { icon: "payments", color: "#10b981" };
        case "tech":
            return { icon: "terminal", color: "#3b82f6" };
        case "mindfulness":
            return { icon: "self_improvement", color: "#14b8a6" };
        case "creative":
            return { icon: "palette", color: "#ec4899" };
        case "travel":
            return { icon: "flight", color: "#f59e0b" };
        case "home":
            return { icon: "home", color: "#84cc16" };
        case "shopping":
            return { icon: "shopping_bag", color: "#6366f1" };
        case "personal":
        default:
            return { icon: "person", color: "#6366f1" };
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
