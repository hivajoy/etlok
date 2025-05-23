module.exports = function(express, app, mongoose, authMiddleware, bot) {
    const eventSchema = new mongoose.Schema({
        title: String,
        description: String,
        date: Date
    });

    const Event = mongoose.model('Event', eventSchema);

  
    // Function to format date in Kolkata (IST) timezone
function formatDateInKolkata(date) {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
    hour12: true // ✅ Use 12-hour format with AM/PM
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', options).formatToParts(date);

  let day, month, year, hour, minute, second, dayPeriod;

  formattedDate.forEach(({ type, value }) => {
    if (type === 'day') day = value;
    if (type === 'month') month = value;
    if (type === 'year') year = value;
    if (type === 'hour') hour = value;
    if (type === 'minute') minute = value;
    if (type === 'second') second = value;
    if (type === 'dayPeriod') dayPeriod = value;
  });

  return `${day}-${month}-${year} : ${hour}:${minute}:${second} ${dayPeriod}`;
}
  
    function getCalendar(month, year) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month - 1, 1).getDay();
        const calendar = [];
        let currentDay = 1;

        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDay) || currentDay > daysInMonth) {
                    week.push(null);
                } else {
                    week.push(currentDay++);
                }
            }
            calendar.push(week);
        }
        return calendar;
    }

    const auth = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).send('Authentication required.');
        }

        const base64 = authHeader.split(' ')[1];
        const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
        if (user === 'admin' && pass === '1234') {
            return next();
        }

        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('Access denied.');
    };

    // Add this middleware to parse form data
    app.use(express.urlencoded({ extended: true }));

    // 📌 POST route to save an event
    app.post('/add-event', auth, async (req, res) => {
        const { title, description, date, time } = req.body;

        const fullDateTime = new Date(`${date}T${time}`);


        try {
            await Event.create({ title, description, date: fullDateTime });
            res.redirect('/shedule');
        } catch (err) {
            res.status(500).send('Failed to add event.');
        }
    });

// 📆 GET route for calendar + events
app.get('/shedule', auth, async (req, res) => {
    const queryMonth = parseInt(req.query.month); // Get the month from query parameter
    const queryYear = parseInt(req.query.year);   // Get the year from query parameter
    const todayDate = new Date();
    
    // Set default to current month/year if not provided or invalid
    const month = (queryMonth >= 1 && queryMonth <= 12) ? queryMonth : todayDate.getMonth() + 1;
    const year = (queryYear >= 1970) ? queryYear : todayDate.getFullYear();

    // Calculate the new monthName based on the selected month and year
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const today = todayDate.getDate();
    const calendar = getCalendar(month, year);

    // 👇 Fetch events for the selected month and year
    const events = await Event.find({
        date: {
            $gte: new Date(`${year}-${month.toString().padStart(2, '0')}-01`),
            $lt: new Date(`${month === 12 ? year + 1 : year}-${(month === 12 ? 1 : month + 1).toString().padStart(2, '0')}-01`)
        }
    }).lean();

    // Map: day number => array of events
    const eventsMap = {};
    events.forEach(event => {
        const day = new Date(event.date).getDate();
        if (!eventsMap[day]) eventsMap[day] = [];
        eventsMap[day].push(event);
    });

    // Sort events by date
    const upcomingEvents = events.sort((a, b) => a.date - b.date);

    // Find the next event after the current date
    const nextEvent = upcomingEvents.find(event => new Date(event.date) > todayDate);

    // Function to calculate time difference in a readable format
    function getTimeRemaining(eventDate) {
        const timeDiff = eventDate - todayDate;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `${days} days, ${hours} hours, ${minutes} minutes`;
    }

    let html = `
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StarTech</title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link href='https://images.scalebranding.com/infinity-star-logo-67e6d544-d612-4e0b-ae07-c73725afe41d.jpg' rel='shortcut icon'/>

<link href='/style.css' rel='stylesheet'/> 
<script >
   

// Menu Togagle Script 
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu.classList.contains('show')) {
        menu.classList.remove('show'); // Close the menu
        setTimeout(() => {
            menu.style.visibility = 'hidden';
        }, 300);
    } else {
        menu.style.visibility = 'visible'; 
        menu.classList.add('show'); // Open the menu
    }
}

function closeMenu() {
    const menu = document.getElementById('menu');
    menu.classList.remove('show'); // Close the menu
    setTimeout(() => {
        menu.style.visibility = 'hidden';
    }, 300);
}


// onclick openlLink 
function openLink(url) {
    window.location.href = url;
}


// Notification Message /ocon 

function showNotification() {
    var notificationMessage = document.getElementById('notificationMessage');
    notificationMessage.style.display = 'block';

    // Hide red dot after clicking the icon
    var redDot = document.getElementById('redDot');
    redDot.style.display = 'none';
  }

  function closeNotification() {
    document.getElementById('notificationMessage').style.display = 'none';
  }



// Toggle the display of the share options
function toggleShareOptions() {
  const shareOptions = document.getElementById('shareOptions');
  shareOptions.style.display = (shareOptions.style.display === "none") ? "block" : "none";
}

// Copy the current page URL to clipboard
function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert("Link copied to clipboard!");
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}
</script>

<style>
body {
  overflow: auto;                /* Allow scrolling */
  -ms-overflow-style: none;      /* IE and Edge */
  scrollbar-width: none;         /* Firefox */
}

body::-webkit-scrollbar {
  display: none;                 /* Chrome, Safari, and Edge (WebKit) */
}
    .sidebar.open + .main .burger {
  display: none;
}

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid #444;
        padding: 5px;
        text-align: left;
        background-color: #222;
    }

    th {
        background-color: #1a1a1a;
        color: #ff6f61;
    }

    td.current-day {
        background-color: #ff6f61;
        color: white;
        font-weight: bold;
    }

    td:hover {
        background-color: #333;
        cursor: pointer;
    }

    .time {
        text-align: center;
        margin-top: 30px;
        color: #ff6f61;
        font-size: 1.8rem;
    }

    form {
        margin-top: 30px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
    }

    input, button {
        padding: 10px 15px;
        border-radius: 5px;
        border: 1px solid #444;
        background-color: #333;
        color: white;
        font-size: 1rem;
    }

    input[type="date"], input[type="time"] {
        background-color: #444;
    }

    .logout-btn {
        background-color: #d32f2f;
        position: fixed;
        top: 25px;
        right: 5px;
        padding:3px 8px;
        border-radius: 10%;
        color: white;
        border: none;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        
    }

    .logout-btn:hover {
        background-color: #b71c1c;
    }

    .add-btn {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #28a745;
        color: white;
        font-size: 30px;
        border: none;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 1000;
    }

    .add-btn:hover {
        background-color: #218838;
    }

    .hidden-form {
        display: none;
        background-color: #1e1e1e;
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }

    .event {
        margin-top: 5px;
        background: #333;
        padding: 6px;
        border-radius: 4px;
        font-size: 14px;
    }

    .event:hover::after {
        opacity: 1;
    }

.event-day {
    position: relative;
    cursor: pointer;
}

.event-day::after {
    content: attr(data-tooltip);
    position: fixed; /* changed from absolute to fixed */
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 14px;
    top: 8%; /* vertically center */
    right: 50%; /* horizontally center */
    transform: translate(-50%, -50%); /* exact center */
    z-index: 999;
    min-width: 250px;
    max-width: 350px;
    white-space: pre-line;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.event-day:hover::after {
    opacity: 1;
}

    /* Mobile responsive */
    @media (max-width: 768px) {
        table, th, td {
            font-size: 14px;
        }

        form {
            flex-direction: column;
            align-items: center;
        }

        .add-btn {
            width: 50px;
            height: 50px;
            font-size: 24px;
        }
        .event-day::after {
    content: attr(data-tooltip);
    position: fixed; /* changed from absolute to fixed */
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 14px;
    top: 20%; /* vertically center */
    left: 50%; /* horizontally center */
    transform: translate(-50%, -50%); /* exact center */
    z-index: 999;
    min-width: 250px;
    max-width: 350px;
    white-space: pre-line;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}
    }
</style>
  <div id="div13"></div>
<br/><br/>
</head>


<body>

<div style="position:fixed;background:black;position: fixed;display: flex;float: none !important;margin: 0 auto !important;top: 0 !important;left: 0 !important;right: 0 !important;width: 100vw !important;height:50px !important;padding:0px 10px;box-sizing: border-box;z-index:9999;">
    <div style="display: flex; align-items: center; width: 100%; height: 50px; position: absolute; background-color: rgba(0, 255, 255, 0.05); z-index: 999;">
      <!--Header Menu Content Start-->

<!-- Menu -->

        <div class="menu" id="menu">
            <span class="close-icon" onclick="closeMenu()">
        <i style="color:#0ff;" class="fa-solid fa-xmark"></i>
    </span>            <!-- Menu Header -->
            <div style="display: flex; align-items: center; top: 0; position: relative; width: 100%; height: 50px; background-color: black;text-align:center;">
                <p style='font-size: 24px; color: #0ff; margin: 0; margin-left: 40px;text-align:center;'><b>STARTECH</b></p>
            </div>

          
            <a onclick="navigateWithLoading('/')">
                <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                    <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-home"></i>
                    <p style='font-size: 16px;margin: 0; cursor: pointer;'>Galactic Console</p>
                </div>
            </a>
        
            <div class="radio">
                <a onclick="navigateWithLoading('/cloud')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Hyperspace Files</p>
                    </div>
                </a>
            </div>
                      <a onclick="openLink('/')">
                <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                    <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-home"></i>
                    <p style='font-size: 16px;margin: 0; cursor: pointer;'>AI Drone Logs</p>
                </div>
            </a>
        
            <div class="radio">
                <a onclick="openLink('/p/radio')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Ship Configuration</p>
                    </div>
                </a>
            </div>
          
                      <div class="radio">
                <a onclick="openLink('/p/radio')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Quantum Storage</p>
                    </div>
                </a>
            </div>
          
                      <div class="radio">
                <a onclick="openLink('/p/radio')">
                    <div class="ul" style='display: flex; align-items: center;position: relative; width: 235px; height:auto;  z-index: 999;'>
                        <i style="color:#0ff;font-size:16px;margin-right:10px;" class="fas fa-dot-circle"></i>
                        <p style='font-size: 16px;margin: 0; cursor: pointer;'>Logout</p>
                    </div>
                </a>
            </div>
            

            <div id="div11" style="justify-content: center; padding: 5px; text-align: center;"></div>
        
        



                <div id="div12" style="justify-content: center; padding: 5px; text-align: center;"></div>
 
        </div>

        
        <!--Header Menu Content End-->
        <div class='menu-icon' onclick='toggleMenu()'>
            <span style='color: #0ff; font-size:24px;margin-right:10px;font- weight:bold;'><b><i class="fa-solid fa-bars"></i></b></span>
        </div>

       
        <div style="display: flex; align-items: center; top: 0; position: relative;">
        <p style='font-size: 24px; color: #0ff; margin: 0; margin-left: 5px;'><b>STARTECH</b></p>
        </div>

        <span class="page-title" id="page-title"></span>

<div onclick="navigateWithLoading('/')" style='width: 32px;height: 32px;background-color:#252525;border-radius: 50%;display: flex;justify-content: center;align-items: center;cursor: pointer;right: 65px;top: auto;position: absolute;' >
            <span style='color: #0ff;font-size:20px;'><i class="fa fa-home"></i></span>
         </div> 

       
<div class='notification-icon' onclick='showNotification()'>
            <span style='color: #0ff;font-size:20px;'><i class="fa-solid fa-bell"></i></span>
            <div class='red-dot' id='redDot'></div>
        </div>
        <div class='notification-message' id='notificationMessage'>
            <div id="div1">Hello</div>
            <span onclick='closeNotification()' style='position: absolute; top: 10px; right: 10px; color: white; cursor: pointer; font-weight: bold;'>&#10006;</span>
        </div>






</div>
</div>

  <div class="main-content">




        <!-- Navigation Buttons -->
        <div style="margin: 0px 20px;display:flex;justify-content:center;align-items:center;">
            <form method="GET" action="/shedule" style="display: inline-block;">
                <input type="hidden" name="month" value="${month === 1 ? 12 : month - 1}">
                <input type="hidden" name="year" value="${month === 1 ? year - 1 : year}">
                <button>&laquo; Prev</button>
            </form>

            <strong style="margin: 0 20px;">${monthName} ${year}</strong>

            <form method="GET" action="/shedule" style="display: inline-block;">
                <input type="hidden" name="month" value="${month === 12 ? 1 : month + 1}">
                <input type="hidden" name="year" value="${month === 12 ? year + 1 : year}">
                <button>Next &raquo;</button>
            </form>
        </div>

        <table>
            <thead>
                <tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>
            </thead>
            <tbody>`;

    calendar.forEach(week => {
        html += '<tr>';
        week.forEach(day => {
            const className = day === today ? 'current-day' : '';
            let tdClass = className;
            let tooltip = '';

            if (day && eventsMap[day]) {
                tdClass += ' event-day';
                tooltip = eventsMap[day].map(ev => `
📌 ${ev.title}
Description: ${ev.description || 'No description'}
Date: ${new Date(ev.date).toLocaleString()}
Time Left: ${getTimeRemaining(new Date(ev.date))}
                `).join("\n\n");
            }

            html += `<td class="${tdClass}" ${tooltip ? `data-tooltip="${tooltip.replace(/"/g, '&quot;')}"` : ''}>`;

            if (day) {
                html += `<div>${day}</div>`;

                if (eventsMap[day]) {
                    eventsMap[day].forEach(ev => {
                        html += `<div class="event">${ev.title}</div>`;
                    });
                }
            }

            html += `</td>`;
        });
        html += '</tr>';
    });
const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const todaysEvents = events.filter(ev => new Date(ev.date) >= startOfDay && new Date(ev.date) <= endOfDay);

if (todaysEvents.length > 0) {
    const eventDetails = todaysEvents.map(ev => 
        `📌 *${ev.title}*\n📝 ${ev.description || 'No description'}\n🕒 ${new Date(ev.date).toLocaleString()}`
    ).join('\n\n');
const OWNER_ID = '5019818643';
    bot.sendMessage(OWNER_ID, `📅 *Today's Events:*\n\n${eventDetails}`, { parse_mode: 'Markdown' });
}

    html += `</tbody></table>

    <!-- Add Event Button -->
    <button id="toggleFormBtn" class="add-btn">+</button>

    <!-- Hidden Event Form -->
    <div id="eventForm" class="hidden-form">
        <form method="POST" action="/add-event">
            <input type="text" name="title" placeholder="Event Title" required>
            <input type="text" name="description" placeholder="Description">
            <input type="date" name="date" required>
            <input type="time" name="time" required>
            <button type="submit">Add Event</button>
        </form>
    </div>

    <div class="time">
        Current Time: <span id="time" style="color:white;">${todayDate.toLocaleTimeString()}</span>
    </div>`;
      // 👇 Group all events for the year (not just the current month)
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year + 1}-01-01`);
    const fullYearEvents = await Event.find({
        date: { $gte: yearStart, $lt: yearEnd }
    }).sort({ date: 1 }).lean();

    const monthlyGrouped = {};
    fullYearEvents.forEach(event => {
        const monthName = new Date(event.date).toLocaleString('default', { month: 'long' });
        if (!monthlyGrouped[monthName]) monthlyGrouped[monthName] = [];
        monthlyGrouped[monthName].push(event);
    });

    html += `
    <!-- Yearly Events Button -->
<button id="showYearlyBtn" style="position: fixed; bottom: 100px; right: 30px; width: 50px; height: 50px; font-size: 24px; border: none; border-radius: 50%; background-color: #007bff; color: white; cursor: pointer; z-index: 1000;" title="Show All Events 📅">📅</button>

<!-- Modal for Yearly Events -->
<div id="yearlyModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; overflow-y: auto;">
  <div style="background: #1a1a1a; margin: 50px auto; padding: 30px; border-radius: 10px; width: 80%; max-width: 800px; color: white; position: relative;">
    <button id="closeModal" style="position: absolute; top: 15px; right: 15px; background: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">✖</button>
    <h2 style="text-align: center;">📅 All Events in ${year}</h2>

    `;

  for (const month in monthlyGrouped) {
    html += `<div style="margin-top: 30px;">
        <h3 style="color: #ff6f61;">${month}</h3>`;
    monthlyGrouped[month].forEach(event => {
        html += `
            <div style="background: #222; margin: 10px 0; padding: 10px; border-radius: 5px;">
                <strong>${event.title}</strong><br>
                ${event.description || 'No description'}<br>
                ${new Date(event.date).toLocaleString()}
                <!-- Add Edit and Delete buttons -->
                <br>
                <a href="/edit-event/${event._id}" style="color: #ffeb3b; text-decoration: none;">Edit</a> | 
                <a href="/delete-event/${event._id}" style="color: #f44336; text-decoration: none;" onclick="return confirm('Are you sure you want to delete this event?');">Delete</a>
            </div>
        `;
    });
    html += `</div>`;
}
html += `
  </div>
</div>
`;


    if (fullYearEvents.length === 0) {
        html += `<p>No events found for ${year}.</p>`;
    }

   


    // Show the next event and time remaining if it exists
    if (nextEvent) {
        html += `
            <div class="time">
                Next Event: <span style="color:white;">${nextEvent.title} on ${new Date(nextEvent.date).toLocaleTimeString()}</span><br>
                Time Remaining: <span style="color:white;">${getTimeRemaining(new Date(nextEvent.date))}</span>
            </div>
        `;
    } else {
        html += `
            <div class="time">
                No upcoming events.
            </div>
        `;
    }

    html += `
  
  <!-- Preloader -->
  <div id="preloader">
    <div class="loader"></div>
    <p style="margin-left:10px;">
      Loading...
    </p>
  </div>

  <script>
    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const burger = document.getElementById('burger');

      sidebar.classList.toggle('open');
      burger.innerText = sidebar.classList.contains('open') ? '×' : '☰';
    }

    function navigateWithLoading(url) {
      const preloader = document.getElementById('preloader');
      preloader.style.display = 'flex';
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    }

    window.addEventListener('load', function () {
      document.getElementById('preloader').style.display = 'none';
    });
  </script>

        <script>
    setInterval(() => {
        document.getElementById('time').textContent = new Date().toLocaleTimeString();
    }, 1000);

    document.getElementById('toggleFormBtn').addEventListener('click', () => {
        const formDiv = document.getElementById('eventForm');
        formDiv.style.display = formDiv.style.display === 'block' ? 'none' : 'block';
    });

    // Handle yearly event modal
    document.getElementById('showYearlyBtn').addEventListener('click', () => {
        document.getElementById('yearlyModal').style.display = 'block';
    });

    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('yearlyModal').style.display = 'none';
    });

    // Optional: close modal on outside click
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('yearlyModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
</script>

    </body>
    </html>`;
  

    res.send(html);
});
app.get('/edit-event/:id', auth, async (req, res) => {
    const eventId = req.params.id;
    const event = await Event.findById(eventId).lean();

    if (!event) {
        return res.status(404).send('Event not found');
    }

    // Render edit form with event details pre-filled
    let html = `
    <html>
    <head>
        <title>Edit Event</title>
        <style>
            body {
                background-color: #121212;
                color: #f1f1f1;
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            h2 {
                font-size: 2rem;
                margin-bottom: 20px;
            }
            form {
                background-color: #1f1f1f;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                width: 100%;
                max-width: 400px;
            }
            input {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                background-color: #333;
                border: 1px solid #444;
                color: #f1f1f1;
                border-radius: 5px;
            }
            input[type="date"], input[type="time"] {
                background-color: #333;
                border: 1px solid #444;
            }
            input:focus {
                border-color: #ff8c00;
                outline: none;
            }
            button {
                width: 100%;
                padding: 12px;
                background-color: #ff8c00;
                border: none;
                color: white;
                font-size: 1.1rem;
                border-radius: 5px;
                cursor: pointer;
            }
            button:hover {
                background-color: #ff6a00;
            }
            .form-container {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <h2>Edit Event</h2>
            <form method="POST" action="/update-event/${event._id}">
                <input type="text" name="title" value="${event.title}" required placeholder="Event Title">
                <input type="text" name="description" value="${event.description}" placeholder="Description">
                <input type="date" name="date" value="${new Date(event.date).toISOString().split('T')[0]}" required>
                <input type="time" name="time" value="${new Date(event.date).toLocaleTimeString().slice(0, 5)}" required>
                <button type="submit">Update Event</button>
            </form>
        </div>
    </body>
    </html>`;
    
    res.send(html);
});

app.post('/update-event/:id', auth, async (req, res) => {
    const eventId = req.params.id;
    const { title, description, date, time } = req.body;

    const updatedDate = new Date(`${date}T${time}`);

    try {
        await Event.findByIdAndUpdate(eventId, { title, description, date: updatedDate });
        res.redirect('/shedule');  // Redirect to schedule page after updating
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating event');
    }
});
app.get('/delete-event/:id', auth, async (req, res) => {
    const eventId = req.params.id;

    try {
        await Event.findByIdAndDelete(eventId);
        res.redirect('/shedule');  // Redirect to schedule page after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting event');
    }
});

    // Logout route
    app.post('/logout', (req, res) => {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).send('Logged out');
    });
};
