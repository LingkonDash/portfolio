hey i want to make a highly attractive and animated material 3D style portfolio. 

heres the (basic) tech stack i will use: 
1. nextJS (typescript);
1. Tailwind CSS;
2. three.js; 
3. gsap;
4. lucide icons;

(more can be added if needed. to make the portfolio attractive or to improve animation ux);

now my idea is a portfolio with best story telling way 3d animated user flow maintain website. everything inside that website is interactive and professionally well coordinated animated. with user interactions. 
step or features in my mind right now (user flow):
- fist a beautiful 3d loading screen a logo will be shown in the loading screen and when the loading finishes the user will or the view port or the user perspective camera you can say will go through the logo and the main landing page will be visible. and i am willing to make a dark focused website. so the theme of loading screen in precise calm dark mode based on our any of dark theme. the main loading screen will be the svg or 3D logo that rotates and builds and after loading shows the amazing animation of going through it like traveling in space and going in destination (landing page). and in the bottom right corner there will be a loader that shows the loading 1 to 100% while loading. and real loading data. like not fake and demo data. this will delay if the lading takes time or fast if loading finished quick. this indicator or loading percent will show real loading delay. 
- in landing page a unique navigation bar.  one side shows only my name Lingkon Dash and other side a animated menu interactive. and by clicking it a new animation triggers and a full screen opens and it should feels like the new modal/screen is grashing the full page with animations and there will be for navigation bar these navigation link will contain 'projects' 'skills' 'connect' 'home' these are well coordinated in 4 portion of the navigation. the bg is primarily in dark calm as well. and also highlights when ever each section will visited, shows cool cursor animations on hover not the easy beginner animations but a pro animations like cursor is sting to the button and buttons changes its form some great and creative animations you know. these navigator will take the user in the specific section. with scroll animations in the page.
- then there will be the home page or landing page where a user/ recruiter will land and first the page there is also some steps. 
1. first the background and the cursor style: 
    - the cursor will be space themed. like a alien space ship in shape of black hole type and the whole background of the page will be a start like 3D particles playground where every start interacts with the cursor. and when the cursor passes these its feels like a black hole swallowing it. the start field also bends with the cursor movements. a complete 3js feel. and the most important part is. noo need to make a whole page start field that will be very lagging and not optimized in week devices. the rendering stuffs. so the playground will be 100dvh 100dvw one playground that sticks in place. but scrolling make it animated like going down or upward. so that do not feels a single stick starts everywhere. and in scrolling there will be a cursor animations too. the cursor will change its form to visual scrolling something like a brusts in the ship will be shown in direction of scroll. the cursor interacts with every buttons and every cards in the whole website. it changes it shape according to the links and buttons and etc, in mobile the custom cursor is hidden cause there is no cursor needed. about the bg it should be calm and it should feels like its a background no highly highlighted so the main information or contexts of the portfolio remains clean and visible readable to the user
2. now the playground and navigation are set. its time to show my information in the banner section. which is for user have came over. there will be 2 portion or side of grid or flex layout. the left side contains my information like hey I am Lingkon Dash Mern Based Full stack developer. with some intro greeting with a type righting animations using gsap. a fullfill right side with info. and a button for my resume. (interective well animated and also cursor reacts to it) clicking it will redirect a user with the drive link of resume. and in the other side there will be a rounded div that contains my professional picture and the div is primarily 3d div but in hover the div shows some 3d movement like tilting toward the cursor and also the shadows of the space floating feels 3d card. intercts with cursor. in mobile the card shows his automated animations no interactions needed but in desktop use full power of three js and make the website like a living creature with animations. you know what i mean. 
3. then comes the about section. there will be my full information with a another rounded picture of my self with exact animations but now noo need to go harder. a section with all details what i do what is my future plans what do they will get if they hire me. and everything a recruiter needs to about me. for the info i will provide you the info about me down below. 
4. now the skills section. here you will use a rotating view of all skill. its will be a half circle style highly animated. and each skills in the circle user scrolls here and the skill description get shown in the middle of the circle. user can see all by scrolling in the circle. the half circumference is visible with skills and half is hidden. with a premium ui. proper descriptions and proper animations. no buffering and stuck feeling in the ui. in mobile it will be in steps not in circles anymore. steps in 1 after another circle is hidden in mobile. and only for big screen
5. then the projects sections. this one will be in a separated blog like section with project number and one side contains description with live url and rpo link and other side contains the picture of the project. appears with animation in scrolls. and a leading object .a space ships or any object that leads a user one to another project with animations use any dynamic curving path or full website rotating animations while going from one project to another animation triggered with scroll. make it mobile responsive use dvh or dvw as much posible to make sure it aint breaks at any device. 
6. the contact section. there you will use a next js mailer to mail lingkondashdev@gmail.com and the in the show some texts that says lets connect and some greeting texts. and then a form of node mailer that will be dynamic and it takes input one my one with user flow animations first the name and then the message and then email. then send. and you can put my location using google map sreemangal moulvibazar customized with the space theme (optional) then you will show the links to connect with me in linked in Github facebook.;

Ui instructions: 

the whole project will be color consist and the theme will be solar space themed. in the backgrond there will be start systems galxy visible in the eye. and stars/white glowing dots is interacting with the cursot. but this background will be calm and not hight contrast to make the text avobe it still visible and readable. the full website will be in 4/5 themed variations. no light ui. dark ui but in different dark freindly colors like nebula style aqua style space style etc. the ui must be consistence make sure no color differs in the ui and for theming you will use two functions like these no theme provider direct functions, so the ui doesnt shows a flash white in first.
// useThemeToggle.js
export function useThemeToggle() {
  const toggleTheme = () => {
    const current = localStorage.getItem("theme") || "light";
    const next = current === "dark" ? "light" : "dark";

    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return toggleTheme;
}

import { useEffect } from "react";

export function useApplyTheme() {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
  });
}

thats the overall idea in my mind. i want to execute it. now act as a professional senior web developer with highly optimized prompt/context engineering skills. now to make this portfolio idea complete publish ready you will use antigravity agentic ai. and in small phases the whole project will be in live phase phase. every details in this project must have complete. no flow in the ui no awfull ui. your task is to make a plan of prompts and give it me one by one. completing the full project by genarating prompts.

i have created the base with nextJS installed i have tuched anything yet. also tell the ai to use metatags of my name lingkon to as the metadata so anyone can find in google with serching mern developer or direct name or full stack developer. proper seo will be our last priority now the ui and build protocol first. 

so make a plan and design prompts line by line in you memory so you wont forget and i will tell you one by one to give me prompts. and i am using free ai so make sure the prompts are highly optimized and our goal is to outcome more works with small but meaning ful and accurate prompt. 

first give me the whole prompt plan how we will be going.
like: 
1. base building,
2. the navbar
then we will go in a sequence prompting one by one and any error i face or any update i will tell you in the go. 
and update you memory with this project core idea. so next time you wont lose track. and IMPORTANT (Do not assume anything ask me if you need any information. no guessing no assuming!);

here is my linked in link: for some info related data you can checkout here. 
https://www.linkedin.com/in/lingkon-dash/

for any images like react/ nextjs/ tailwind icons and etc tell the ai in prompt to leave spaces or use dummy links i will fill that up manually



About Me: 
 - my bio paragraph(s): Full Stack Developer | Next.js | React | Node.js | MongoDB | Building Scalable Web Apps

 - linked in about: Hi, Myself Lingkon Dash. I am a passionate Full Stack Web Developer with hands-on experience building scalable, user-friendly web applications using MongoDB, Express.js, Nextjs, and Node.js. My focus is on writing clean, maintainable code and crafting intuitive, user-centric interfaces.

I have a solid foundation in JavaScript, REST APIs, Git, and Tailwind CSS, and I enjoy the challenge of turning complex logic into functional, production-ready projects. Whether it's building interactive features or structuring scalable backend systems, I am driven by continuous learning and problem-solving.

What I bring to the table:
Frontend Development: Building dynamic, responsive user interfaces with React and Tailwind CSS.
JavaScript & Problem-Solving: Sharpening my logic through consistent practice on LeetCode.
Backend Fundamentals: Working with Node.js, Express, and MongoDB to power full-stack applications.

I have recently completed my learning journey and worked on several production-level projects. I am highly motivated, disciplined, and currently open for work — looking for remote frontend or junior/mid-level full-stack roles where I can grow, contribute, and build impactful web projects.

 - future plans looking for opportunity
 - why hire you: fill up based on about;

Skills list — html, css, react, nextjs, nodejs, express js, mongodb, better-auth, vercel, vite, vs code, 

use the skill description like this: 
I use HTML5 as the structural backbone of every project, focusing on semantic elements for accessibility, SEO, and maintainability. I ensure proper document hierarchy, optimized media handling, and clean, readable markup that integrates seamlessly with modern frameworks.

I design responsive and scalable interfaces using modern CSS techniques like Flexbox, Grid, and custom properties. I focus on performance, reusability, and consistency, often combining CSS with utility-first approaches for rapid UI development.

and remember the circle design like with animation;

and i will implement a dedicated project details page. so for now that much is okay. show a view details button in the cards and live link: gitgub repo link will be in the details page. (live placeholder dummy links to the buttons live link and repo links.)

Projects :
1. Recipe Hut: AI-powered recipe discovery and cooking platform built as a complete Agentic AI application. Beyond standard CRUD and content browsing, it integrates two distinct agentic AI systems — a context-aware conversational assistant and a reasoning-driven pantry agent — that go beyond simple text generation to demonstrate memory, tool use, and decision-making. An intelligent cooking assistant with AI chat, recipe insights, and interactive guidance.

2. Book Hub : BookHub is a full-stack Online Book Delivery Management System where readers can browse a curated library, pay a delivery fee via Stripe, and have physical books delivered to their doorstep. Librarians manage their book listings and track delivery statuses. Admins oversee the entire platform — approving books, managing users, and monitoring transactions.

3. Space Sync: SpaceSync is a full-stack co-working and event space booking platform where renters discover and book desks, meeting rooms, event halls, and studios — and hosts list and manage their own spaces. Built with a strict three-role system (User, Host, Admin), server-driven filtering, and a fully typed TypeScript stack across both frontend and backend.

Resume — (i dont have one right now leave it empty i will make one later)

Contact location : Sreemangal

GitHub : https://github.com/LingkonDash

LinkedIn : https://www.linkedin.com/in/lingkon-dash/

Facebook : https://www.facebook.com/lingkon.dash.2025

WhatsApp : 01776572194

Theme naming: name something meaning full and do not name them like this cause i said. something that means. and use some easy words naming or use just color ball or a div showing the colors will be used in the theme in side of the name. you can name them whatever you want but i want the colors they will apply should be included in the button of that theme. and for theming you can use nextTheme or any library to make it efficient. i do not want any white flash in first load;