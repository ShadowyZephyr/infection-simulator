PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
import * as stats from "/infection-simulator/stats.js"
const sick = PIXI.Texture.from('/infection-simulator/assets/red.png')
const healthy = PIXI.Texture.from('/infection-simulator/assets/blue.png')
const vaccinated = PIXI.Texture.from('/infection-simulatorassets/green.png')
const sick_vaccinated = PIXI.Texture.from('/infection-simulator/assets/red-green.png')
const sick_doctor = PIXI.Texture.from('/infection-simulator/assets/red-outline.png')
const healthy_doctor = PIXI.Texture.from('/infection-simulator/assets/blue-outline.png')
const healthy_vaccinated_doctor = PIXI.Texture.from('/infection-simulator/assets/green-outline.png')
const sick_vaccinated_doctor = PIXI.Texture.from('/infection-simulator/assets/red-green-outline.png')
const play = PIXI.Texture.from('/infection-simulator/assets/play.png')
const pause = PIXI.Texture.from('/infection-simulator/assets/pause.png')
const restart = PIXI.Texture.from('/infection-simulator/assets/restart.png')
const info = PIXI.Texture.from('/infection-simulator/assets/info.png')
const settings = PIXI.Texture.from('/infection-simulator/assets/settings.png')
const stat = PIXI.Texture.from('/infection-simulator/assets/stats.png')
let instances = [];
const gamelog = {};
gamelog.infected_log = [];
gamelog.eradicated_log = [];
let fps = [];
let buttons = [];
let running = true;
const params = {
    speed: 5,
    population: 30,
    initial_sick: 0.1,
    infection_radius: 20,
    tpf: 1,
    duration: 0,
    heal_radius: 20,
    initial_doctors: 0.05,
    sprite_size: 75
};
const limits = {
    sprite_size: [0, 1000],
    tpf: [0,100000],
    speed: [-Infinity, Infinity],
    population: [0, 10000],
    initial_sick: [0,1],
    infection_radius: [0, window.innerWidth],
    duration: [0, Infinity],
    initial_doctors: [0,1],
    heal_radius: [0, window.innerWidth]
};
let div, infected, ticks, doctors, sicks, lastPopulation;
let frames = 0;
let statsOpen = false;
function startSim() {
    if (instances.length > 0) {
        for(const v of instances) {
            v.destroy();
        }
        instances = [];
    }
    ticks = 0;
    infected = 0;
    sicks = 0;
    doctors = 0;
    lastPopulation = params.population;
    div = 1/(params.tpf - Math.floor(params.tpf));
    for (let i = 0; i < params.population; i++) {
        instances.push(initPerson(healthy));
        if(Math.random() <= params.initial_doctors) {
            makeDoctor(instances[i]);
        }
        if(Math.random() <= params.initial_sick) {
            infect(instances[i]);
        }
    }
    if (infected == 0) {
        for(let j = 0; j < instances.length; j++) {
            if(!isDoctor(instances[j])) {
                infect(instances[j]);
                break;
            }   
        }
    }
}
const app = new PIXI.Application(
    {
        backgroundColor: 0xFFFFFF,
        resizeTo: window
    }
);
document.body.appendChild(app.view);
const verdana = new PIXI.TextStyle({
    fontFamily: 'Verdana',
    fontSize: app.screen.width * 0.01,
    fill: '#000000',
    align: 'left'

});
function createButton(texture, x, f) {
    const button = new PIXI.Sprite(texture);
    button.width = app.screen.width * 0.03;
    button.height = app.screen.width * 0.03;
    button.x = app.screen.width * x;
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.on('pointerdown', f);
    buttons.push(button);
    app.stage.addChild(button);
}
const tickDisplay = new PIXI.Text('Waiting for load placeholder', verdana);
tickDisplay.x = app.screen.width * 0.01;
tickDisplay.y = app.screen.height * 0.07;
app.stage.addChild(tickDisplay);
const tpsDisplay = new PIXI.Text('Waiting for load placeholder', verdana);
tpsDisplay.x = app.screen.width * 0.01;
tpsDisplay.y = app.screen.height * 0.12;
app.stage.addChild(tpsDisplay);
const log = new PIXI.Text('', verdana);
log.x = app.screen.width * 0.01;
log.y = app.screen.height * 0.17;
app.stage.addChild(log);
const sickDisplay = new PIXI.Text('Waiting for load placeholder', verdana);
sickDisplay.x = app.screen.width * 0.01;
sickDisplay.y = app.screen.height * 0.9;
app.stage.addChild(sickDisplay);
const doctorDisplay = new PIXI.Text('Waiting for load placeholder', verdana);
doctorDisplay.x = app.screen.width * 0.01;
doctorDisplay.y = app.screen.height * 0.95;
app.stage.addChild(doctorDisplay);
createButton(pause, 0, toggleGame);
createButton(restart, 0.05, startSim);
createButton(info, 0.1, toggleInfo);
createButton(settings, 0.15, toggleSettings);
createButton(stat, 0.2, toggleStats);
document.getElementById('apply').addEventListener("click", applySettings);
startSim();

function toggleGame() {
    running = !running;
    if(running) {
        buttons[0].texture = pause;
    } else {
        buttons[0].texture = play;
    }
}
function toggleInfo() {
    const info = document.getElementById('info');
    const style = window.getComputedStyle(info);
    if (style.getPropertyValue('display') == 'block') {
        info.style.display = 'none';
    } else {
        info.style.display = 'block';
    }
}
function toggleSettings() {
    const settings = document.getElementById('settings');
    const style = window.getComputedStyle(settings);
    if (style.getPropertyValue('display') == 'block') {
        settings.style.display = 'none';
    } else {
        settings.style.display = 'block';
        for (const v of Object.getOwnPropertyNames(params)) {
            const input = document.getElementById(v);
            input.value = params[v];
        }
    }
}
function applySettings() {
    let resetLog = false;
    for (const v of Object.getOwnPropertyNames(params)) {
        const input = document.getElementById(v);
        if (!(input.value == '')) {
            if (!Number(input.value) && input.value !== '0') {
                input.value = params[v];
            }
            if (input.value >= limits[v][1]) {
                input.value = limits[v][1];
            } else if (input.value <= limits[v][0]) {
                input.value = limits[v][0];
            } 
            if (params[v] !== Number(input.value) && v !== 'tpf' && v !== 'sprite_size') {
                resetLog = true;
            }
            params[v] = Number(input.value);
            div = 1/(params.tpf - Math.floor(params.tpf));
        }
    }
    if(resetLog) {
        gamelog.infected_log = [];
        gamelog.eradicated_log = [];
    }
}
function toggleStats() {
    const stats = document.getElementById('stats');
    const style = window.getComputedStyle(stats);
    statsOpen = !statsOpen;
    if (style.getPropertyValue('display') == 'block') {
        stats.style.display = 'none';
    } else {
        stats.style.display = 'block';
        updateStats();
    }
}
function updateStats() {
    const total = gamelog.eradicated_log.length + gamelog.infected_log.length;
    document.getElementById('eradicated').innerHTML = 'Eradicated: ' + gamelog.eradicated_log.length + ' (' + stats.roundToDec(((gamelog.eradicated_log.length/total)*100),2) + '%)'
    document.getElementById('infected').innerHTML = 'Infected All: ' + gamelog.infected_log.length + ' (' + stats.roundToDec(((gamelog.infected_log.length/total)*100),2) + '%)'
    if(gamelog.eradicated_log.length > 0) {
        document.getElementById('max_eradicated').innerHTML = 'Max Ticks: ' + Math.max(...gamelog.eradicated_log) 
        document.getElementById('min_eradicated').innerHTML = 'Min Ticks: ' + Math.min(...gamelog.eradicated_log) 
        document.getElementById('mean_eradicated').innerHTML = 'Mean Ticks: ' + stats.roundToDec(stats.mean(gamelog.eradicated_log),2)
        document.getElementById('median_eradicated').innerHTML = 'Median Ticks: ' + stats.roundToDec(stats.median(gamelog.eradicated_log),2)
        document.getElementById('stdev_eradicated').innerHTML = 'Std. Dev: ' + stats.roundToDec(stats.stdev(gamelog.eradicated_log),2)
    }
    if(gamelog.infected_log.length > 0) {
        document.getElementById('max_infected').innerHTML = 'Max Ticks: ' + Math.max(...gamelog.infected_log) 
        document.getElementById('min_infected').innerHTML = 'Min Ticks: ' + Math.min(...gamelog.infected_log) 
        document.getElementById('mean_infected').innerHTML = 'Mean Ticks: ' + stats.roundToDec(stats.mean(gamelog.infected_log),2)
        document.getElementById('median_infected').innerHTML = 'Median Ticks: ' + stats.roundToDec(stats.median(gamelog.infected_log),2)
        document.getElementById('stdev_infected').innerHTML = 'Std. Dev: ' + stats.roundToDec(stats.stdev(gamelog.infected_log),2)
    }
}
function collision(x,y,r,x2,y2,r2) {
    return Math.sqrt((x - x2) ** 2 + (y - y2) ** 2) < (r + r2)
}
function initPerson(type) {
    const person = new PIXI.Sprite(healthy);
    person.anchor.set(0.5);
    person.x = Math.random() * app.screen.width;
    person.y = Math.random() * app.screen.height;
    person.width = params.sprite_size;
    person.height = params.sprite_size;
    person.vx = (Math.random() - 0.5) * params.speed;
    person.vy = (Math.random() - 0.5) * params.speed;
    app.stage.addChild(person);
    if (type == sick) {
        infect(person);
    }
    return person;
}
function keyboard(value) {
    const key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    key.downHandler = (event) => {
        if (event.key === key.value) {
            if (key.isUp && key.press) {
                key.press();
            }
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };
    key.upHandler = (event) => {
        if (event.key === key.value) {
            if (key.isDown && key.release) {
                key.release();
            }
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };  
    return key;
}
const space = keyboard(" ");
space.press = () => {
    toggleGame();
};
const r = keyboard("r");
r.press = () => {
    startSim();
}
const i = keyboard("i");
i.press = () => {
    toggleInfo();
}
const t = keyboard("t");
t.press = () => {
    tick();
}
const y = keyboard("y");
y.press = () => {
    for(let i = 0; i < 10; i++) {
        tick();
    }
}
const s = keyboard("s");
s.press = () => {
    toggleSettings();
}
const a = keyboard("a");
a.press = () => {
    if(document.getElementById('settings').style.display == 'block') {
        applySettings();
    }
}
const d = keyboard("d");
d.press = () => {
    toggleStats();
}
function bounce(sprite) {
    if (sprite.x < 0) {
        sprite.x = 0;
        sprite.vx *= -1;
    }
    if (sprite.x > app.screen.width) {
        sprite.x = app.screen.width;
        sprite.vx *= -1;
    }
    if (sprite.y > app.screen.height) {
        sprite.y = app.screen.height;
        sprite.vy *= -1;
    }
    if (sprite.y < 0) {
        sprite.y = 0;
        sprite.vy *= -1;
    }
}

function touching_infected(me) {
    for (const other of instances) {
        if (isInfected(other) && other !== me && collision(me.x, me.y, params.infection_radius, other.x, other.y, params.infection_radius)) {
            return true;
        }
    }
    return false;
}
function touching_doctor(me) {
    for (const other of instances) {
        if (isDoctor(other) && other !== me && collision(me.x, me.y, params.heal_radius, other.x, other.y, params.heal_radius)) {
            return true;
        }
    }
    return false;
}
function updateFPS() {
    if (running) {
        if(fps.length < 70) {
            fps.push(app.ticker.FPS);
        } else {
            fps.shift();
            fps.push(app.ticker.FPS);
        }
    }
}
setInterval(updateFPS, 20);

function infect(me) {
    if(me.texture == healthy) {
        me.texture = sick;
    } else if (me.texture == healthy_doctor) {
        me.texture = sick_doctor;
    }
    sicks++;
    if(!isDoctor(me)) {
        infected++;
        console.log(infected);
    }
    if(params.duration) {
        me.timer = params.duration;
    }
}
function makeDoctor(me) {
    if(me.texture == healthy) {
        me.texture = healthy_doctor;
    } else if (me.texture == sick) {
        me.texture = sick_doctor;
    }
    doctors++;
}
function makeCivilian(me) {
    if(me.texture == healthy_doctor) {
        me.texture = healthy;
    } else if (me.texture == sick_doctor) {
        me.texture = sick;
    }
    doctors--;
}
function makeHealthy(me) {
    if(me.texture == sick) {
        me.texture = healthy;
    } else if (me.texture == sick_doctor) {
        me.texture = healthy_doctor;
    }
    sicks--;
    if(!isDoctor(me)) {
        infected--;
        console.log(infected);
    }
}
function isInfected(me) {
    return me.texture == sick || me.texture == sick_vaccinated;
}
function isSick(me) {
    return me.texture == sick || me.texture == sick_vaccinated || me.texture == sick_doctor || me.texture == sick_vaccinated_doctor;
}
function isDoctor(me) {
    return me.texture == healthy_doctor || me.texture == sick_doctor || me.texture == healthy_vaccinated_doctor || me.texture == sick_vaccinated_doctor;
}
function isHealthy(me) {
    return me.texture == healthy || me.texture == vaccinated || me.texture == healthy_doctor;
}
function tick() {
    ticks++;
    for (const person of instances) {
        person.x += person.vx; 
        person.y += person.vy;
        bounce(person);
        if (isHealthy(person) && touching_infected(person)) {
            infect(person);
        } else if (isSick(person) && touching_doctor(person)) {
            makeHealthy(person);
        } else if (params.duration && isSick(person)) {
            person.timer--;
            if (person.timer <= 0) {
                makeHealthy(person);
            }
        } 
    }
    if (sicks >= lastPopulation) {
        gamelog.infected_log.push(ticks);
        log.text = 'Last: Disease infected all susceptible in ' + gamelog.infected_log[gamelog.infected_log.length-1] + ' ticks'
        if(statsOpen) {
            updateStats();
        }
        startSim();
    }
    if (infected == 0) {
        gamelog.eradicated_log.push(ticks);
        log.text = 'Last: Disease eradicated in ' + gamelog.eradicated_log[gamelog.eradicated_log.length-1] + ' ticks'
        if(statsOpen) {
            updateStats();
        }
        startSim();
    }
}    
app.ticker.add(() => {
    tickDisplay.text = 'Ticks: ' + ticks;
    tpsDisplay.text = 'FPS: ' + Math.round(stats.mean(fps)) + '/' + Math.round(Math.min(...fps));
    sickDisplay.text = 'Sick: ' + sicks;
    doctorDisplay.text = 'Doctors: ' + doctors;
    frames++;
    if (running) {
        for(let i = 0; i < Math.floor(params.tpf); i++) {
            tick();
        }
        if(!Number.isInteger(params.tpf)) {
            const mod = frames % div;
            if (mod < 1) {
                tick();
            }
        }
    }
});
