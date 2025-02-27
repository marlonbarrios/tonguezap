let faceDetector;
let video;
let faces = [];
const MIN_MOUTH_HEIGHT = 15;
const CATCH_MOUTH_HEIGHT = 25;

// Game variables
let score = 0;
let level = 1;
let fallSpeed = 1;
let spawnInterval = 1500; // Time between token spawns in ms
let lastSpawnTime = 0;
let difficultyTimer = 0;
const DIFFICULTY_INCREASE = 10000; // Increase difficulty every 10 seconds

// Array for tokens
let tokens = [];

// Add these variables at the top
let canvasWidth;
let canvasHeight;

// Add these game variables at the top
const GAME_DURATION = 60; // Game lasts 60 seconds
let gameStartTime;
let timeLeft;
let maxScore = 0;  // Track high score
let gameState = 'start';  // 'start', 'playing', or 'gameover'

// Update these constants for better token spawning
const MAX_TOKENS = 15;          // Allow more tokens
const MAX_FALLING_TOKENS = 8;   // Limit falling tokens
const INITIAL_SPAWN_INTERVAL = 1000;  // Spawn faster (1 second)
const NOTES = [220, 293.66, 349.23, 440]; // Fewer notes

// Update these constants for better ground behavior
const BOUNCE_DAMPING = 0.4;    // More bounce
const FRICTION = 0.98;         // Less friction
const MIN_BOUNCE_VELOCITY = 0.8; // Minimum velocity to bounce
const GRAVITY = 0.2;          // Slightly more gravity
const STACK_FORCE = 1.2;       // Stronger stacking force
const MAX_VELOCITY = 4;        // Lower max velocity

// Update these constants for better mouth attraction
const MOUTH_ATTRACTION_RANGE = 400;    // Bigger range of attraction
const MOUTH_ATTRACTION_FORCE = 2.5;    // Stronger pull
const MOUTH_EAT_ZONE = 0.6;           // Bigger eating zone
const ATTRACTION_SMOOTHNESS = 0.92;    // Smoother movement
const GRAVITY_CANCEL = 0.8;           // More gravity cancellation

// Add these retro color constants
const RETRO_COLORS = [
    [255, 87, 87],   // Retro red
    [87, 255, 132],  // Retro green
    [87, 198, 255],  // Retro blue
    [255, 180, 87],  // Retro orange
    [198, 87, 255]   // Retro purple
];

// Add these sound constants
const COLLECT_FREQUENCIES = [523.25, 659.25, 783.99, 1046.50];  // C5, E5, G5, C6
const BOUNCE_FREQUENCIES = [261.63, 329.63, 392.00];  // C4, E4, G4

// Add these Pac-Man animation constants
const PAC_COLORS = [
    [255, 255, 0],    // Classic yellow
    [255, 182, 255],  // Pink
    [0, 255, 255],    // Cyan
    [255, 182, 85]    // Orange
];

// Add these constants for the mouth beam
const BEAM_COLOR = [0, 255, 255];  // Cyan beam
const BEAM_MAX_OPACITY = 180;
const BEAM_WIDTH = 3;
const BEAM_SEGMENTS = 8;

// Add these constants for the tongue effect
const TONGUE_COLOR = [255, 100, 100];  // Reddish tongue
const TONGUE_WIDTH = 15;
const TONGUE_SEGMENTS = 12;
const TONGUE_WAVE_AMPLITUDE = 8;

// Add these constants for fly animation
const WING_SPEED = 0.3;
const WING_AMPLITUDE = 15;
const FLY_COLORS = [
    [0, 0, 0],      // Black fly
    [20, 20, 80],   // Blue-ish fly
    [80, 20, 20],   // Red-ish fly
    [20, 80, 20]    // Green-ish fly
];

// Add these sound constants at the top
let buzzOscillator = null;
let buzzVolume = 0.02;  // Very quiet buzz
const BUZZ_FREQUENCY = 220;  // Low frequency for soft buzz

// Update these constants at the top
const EYE_SCALE = 0.2;          // Eye size
const EYE_SEPARATION = 0.3;     // Horizontal separation
const EYE_LIFT = 40;            // Vertical lift

// Update these swarming constants for more spread
const SWARM_RADIUS = 400;        // Much larger radius
const SEPARATION_FORCE = 5.0;    // Much stronger separation
const COHESION_FORCE = 0.05;    // Very weak cohesion
const ALIGNMENT_FORCE = 0.1;     // Very weak alignment
const MAX_SPEED = 4;            // Faster max speed
const RANDOM_FORCE = 1.5;       // Much stronger random movement
const EDGE_MARGIN = 100;        // Smaller edge margin
const RANDOM_INTERVAL = 10;     // More frequent random movement

// Add these tongue mechanics constants
const TONGUE_SHOOT_SPEED = 40;    // Speed of tongue shooting out
const TONGUE_RETRACT_SPEED = 30;  // Speed of tongue retracting
const TONGUE_MAX_LENGTH = 400;    // Maximum tongue length
const TONGUE_HIT_RADIUS = 30;     // Hit detection radius

// Add to global variables
let tongueState = 'ready';        // 'ready', 'shooting', 'retracting'
let tongueTarget = null;          // Target fly
let tongueLength = 0;             // Current tongue length
let tongueStartX = 0;             // Tongue start position
let tongueStartY = 0;

// Add these constants for fly death animation
const DEATH_FADE_SPEED = 15;     // How fast fly fades out
const TONGUE_CATCH_SPEED = 30;   // How fast tongue pulls fly back

// Add these constants for fly catch animation
const CATCH_SPEED = 15;        // Speed of fly being pulled
const CATCH_ROTATION_SPEED = 0.5; // How fast fly spins when caught

// Add these sound constants
const SHOOT_FREQ = 200;      // Base frequency for shooting sound
const CATCH_FREQ = 400;      // Base frequency for catching sound

// Add these eye movement constants
const EYE_TRACK_RANGE = 300;    // Distance at which eyes start tracking fly
const EYE_WANDER_SPEED = 0.02;  // Speed of random eye movement
const EYE_TRACK_SPEED = 0.1;    // Speed of fly tracking

// Add these variables for eye movement
let leftEyeAngle = 0;
let rightEyeAngle = 0;
let wanderAngle = 0;

// Add this variable at the top with other globals
let startScreenFly = null;

// Add these variables at the top
let soundEnabled = true;  // Sound state
let startScreenBuzz = null;  // Buzz sound for demo fly

// Add this variable at the top to track game over sounds
let gameOverSounds = [];

// Add this constant for the video overlay
const VIDEO_OVERLAY = {
    color: [50, 55, 59],  // onyx
    alpha: 150  // Semi-transparent
};

// Update the color constants with the new palette
const COLORS = {
    background: [50, 55, 59, 200],     // onyx with some transparency
    title: [244, 184, 96],             // hunyadi-yellow
    instructions: {
        line1: [244, 214, 204],        // pale-dogwood
        line2: [244, 184, 96],         // hunyadi-yellow
        line3: [200, 62, 77]           // bittersweet-shimmer
    },
    eyes: {
        white: [244, 214, 204],        // pale-dogwood
        iris: [74, 88, 89],            // outer-space
        outline: [50, 55, 59],         // onyx
        pupil: [200, 62, 77]           // bittersweet-shimmer
    },
    startPrompt: [244, 184, 96],       // hunyadi-yellow
    tongue: [200, 62, 77],             // bittersweet-shimmer
    soundButton: {
        background: [50, 55, 59],      // onyx
        icon: [244, 214, 204],         // pale-dogwood
        muted: [200, 62, 77]           // bittersweet-shimmer
    }
};

// Update the game over sound constants
const GAME_OVER_SOUNDS = {
    frequencies: [
        440.00,  // A4
        349.23,  // F4
        293.66,  // D4
        440.00,  // A4
        523.25   // C5
    ],
    durations: [0.1, 0.1, 0.1, 0.1, 0.3],
    type: 'sawtooth'  // Use sawtooth for buzzy sound
};

class Token {
    constructor(x) {
        this.position = createVector(
            random(EDGE_MARGIN, canvasWidth - EDGE_MARGIN),
            random(EDGE_MARGIN, canvasHeight - EDGE_MARGIN)
        );
        this.velocity = p5.Vector.random2D().mult(2);
        this.size = canvasWidth * 0.03;
        this.rotation = random(TWO_PI);
        
        // Fly-specific properties
        this.wingPhase = random(TWO_PI);
        this.bodyWiggle = random(TWO_PI);
        this.flyColor = random(FLY_COLORS);
        this.alpha = 255;
        this.hasScored = false;
        this.radius = this.size / 2;
        
        // Movement properties
        this.targetAngle = random(TWO_PI);
        this.currentAngle = 0;
        this.wiggleSpeed = random(0.05, 0.1);
        
        // New property for death animation
        this.isDying = false;
        this.deathProgress = 0;  // Track death animation
    }

    draw() {
        if (this.isDying) {
            // Shrink and fade while being eaten
            let scale = map(this.deathProgress, 0, 1, 1, 0.2);
            let alpha = map(this.deathProgress, 0, 1, 255, 0);
            
            push();
            translate(this.position.x, this.position.y);
            scale(scale);
            // Update existing alpha usage
            this.alpha = alpha;
            rotate(this.rotation);

            // Wing animation
            let wingAngle = sin(frameCount * WING_SPEED + this.wingPhase) * WING_AMPLITUDE;
            
            // Draw wings
            fill(200, 200, 200, this.alpha * 0.7);
            noStroke();
            
            // Left wing
            push();
            rotate(radians(-20 + wingAngle));
            ellipse(-this.size * 0.4, 0, this.size * 0.8, this.size * 0.3);
            pop();
            
            // Right wing
            push();
            rotate(radians(20 - wingAngle));
            ellipse(this.size * 0.4, 0, this.size * 0.8, this.size * 0.3);
            pop();

            // Draw body
            fill(this.flyColor[0], this.flyColor[1], this.flyColor[2], this.alpha);
            noStroke();
            
            // Body segments
            let bodyWiggle = sin(frameCount * 0.2 + this.bodyWiggle) * 2;
            
            // Rear segment
            ellipse(0, this.size * 0.2, this.size * 0.5, this.size * 0.6);
            
            // Middle segment
            ellipse(0, 0, this.size * 0.4, this.size * 0.4);
            
            // Head
            ellipse(0, -this.size * 0.2, this.size * 0.3, this.size * 0.3);

            // Eyes
            fill(255, 0, 0, this.alpha);
            ellipse(-this.size * 0.1, -this.size * 0.25, this.size * 0.15, this.size * 0.15);
            ellipse(this.size * 0.1, -this.size * 0.25, this.size * 0.15, this.size * 0.15);

            // Legs
            stroke(this.flyColor[0], this.flyColor[1], this.flyColor[2], this.alpha);
            strokeWeight(1);
            for (let i = -1; i <= 1; i++) {
                let legWiggle = sin(frameCount * 0.3 + i) * 5;
                // Left leg
                let leftX = -this.size * 0.3;
                let rightX = this.size * 0.3;
                let y = i * this.size * 0.15;
                bezier(leftX, y, 
                       leftX - this.size * 0.2, y + legWiggle,
                       leftX - this.size * 0.4, y + this.size * 0.2 + legWiggle,
                       leftX - this.size * 0.5, y + this.size * 0.3);
                // Right leg
                bezier(rightX, y,
                       rightX + this.size * 0.2, y + legWiggle,
                       rightX + this.size * 0.4, y + this.size * 0.2 + legWiggle,
                       rightX + this.size * 0.5, y + this.size * 0.3);
            }

            // Antennae
            let antennaWiggle = sin(frameCount * 0.2) * 3;
            line(0, -this.size * 0.2, -this.size * 0.2, -this.size * 0.4 + antennaWiggle);
            line(0, -this.size * 0.2, this.size * 0.2, -this.size * 0.4 + antennaWiggle);

            pop();
        } else {
            // Normal drawing code
            push();
            translate(this.position.x, this.position.y);
            rotate(this.rotation);

            // Wing animation
            let wingAngle = sin(frameCount * WING_SPEED + this.wingPhase) * WING_AMPLITUDE;
            
            // Draw wings
            fill(200, 200, 200, this.alpha * 0.7);
            noStroke();
            
            // Left wing
            push();
            rotate(radians(-20 + wingAngle));
            ellipse(-this.size * 0.4, 0, this.size * 0.8, this.size * 0.3);
            pop();
            
            // Right wing
            push();
            rotate(radians(20 - wingAngle));
            ellipse(this.size * 0.4, 0, this.size * 0.8, this.size * 0.3);
            pop();

            // Draw body
            fill(this.flyColor[0], this.flyColor[1], this.flyColor[2], this.alpha);
            noStroke();
            
            // Body segments
            let bodyWiggle = sin(frameCount * 0.2 + this.bodyWiggle) * 2;
            
            // Rear segment
            ellipse(0, this.size * 0.2, this.size * 0.5, this.size * 0.6);
            
            // Middle segment
            ellipse(0, 0, this.size * 0.4, this.size * 0.4);
            
            // Head
            ellipse(0, -this.size * 0.2, this.size * 0.3, this.size * 0.3);

            // Eyes
            fill(255, 0, 0, this.alpha);
            ellipse(-this.size * 0.1, -this.size * 0.25, this.size * 0.15, this.size * 0.15);
            ellipse(this.size * 0.1, -this.size * 0.25, this.size * 0.15, this.size * 0.15);

            // Legs
            stroke(this.flyColor[0], this.flyColor[1], this.flyColor[2], this.alpha);
            strokeWeight(1);
            for (let i = -1; i <= 1; i++) {
                let legWiggle = sin(frameCount * 0.3 + i) * 5;
                // Left leg
                let leftX = -this.size * 0.3;
                let rightX = this.size * 0.3;
                let y = i * this.size * 0.15;
                bezier(leftX, y, 
                       leftX - this.size * 0.2, y + legWiggle,
                       leftX - this.size * 0.4, y + this.size * 0.2 + legWiggle,
                       leftX - this.size * 0.5, y + this.size * 0.3);
                // Right leg
                bezier(rightX, y,
                       rightX + this.size * 0.2, y + legWiggle,
                       rightX + this.size * 0.4, y + this.size * 0.2 + legWiggle,
                       rightX + this.size * 0.5, y + this.size * 0.3);
            }

            // Antennae
            let antennaWiggle = sin(frameCount * 0.2) * 3;
            line(0, -this.size * 0.2, -this.size * 0.2, -this.size * 0.4 + antennaWiggle);
            line(0, -this.size * 0.2, this.size * 0.2, -this.size * 0.4 + antennaWiggle);

            pop();
        }
    }

    update() {
        if (!this.hasScored) {
            // Add more random movement
            if (frameCount % RANDOM_INTERVAL === 0) {
                // Stronger random direction changes
                this.velocity.add(p5.Vector.random2D().mult(RANDOM_FORCE));
                // Random speed changes
                this.velocity.mult(random(0.8, 1.2));
            }
            
            // Weaker swarming behavior
            let separation = createVector(0, 0);
            let neighborCount = 0;
            
            tokens.forEach(other => {
                if (other !== this && !other.hasScored) {
                    let d = dist(this.position.x, this.position.y,
                               other.position.x, other.position.y);
                               
                    // Only care about separation, ignore cohesion/alignment
                    if (d < SWARM_RADIUS) {
                        let separationForce = map(d, 0, SWARM_RADIUS, 5, 0);
                        let diff = p5.Vector.sub(this.position, other.position);
                        diff.normalize();
                        diff.mult(separationForce);
                        separation.add(diff);
                        neighborCount++;
                    }
                }
            });
            
            // Apply separation force
            if (neighborCount > 0) {
                separation.mult(SEPARATION_FORCE);
                this.velocity.add(separation);
            }
            
            // Bounce off edges more dramatically
            if (this.position.x < EDGE_MARGIN) this.velocity.x = abs(this.velocity.x) * 2;
            if (this.position.x > width - EDGE_MARGIN) this.velocity.x = -abs(this.velocity.x) * 2;
            if (this.position.y < EDGE_MARGIN) this.velocity.y = abs(this.velocity.y) * 2;
            if (this.position.y > height - EDGE_MARGIN) this.velocity.y = -abs(this.velocity.y) * 2;
            
            // Add some chaotic movement
            this.velocity.add(noise(this.position.x * 0.01, this.position.y * 0.01, frameCount * 0.01) - 0.5,
                             noise(this.position.y * 0.01, frameCount * 0.01, this.position.x * 0.01) - 0.5);
            
            // Update position with higher speed limit
            this.velocity.limit(MAX_SPEED * random(0.8, 1.2));
            this.position.add(this.velocity);
            
            // More erratic rotation
            this.rotation = atan2(this.velocity.y, this.velocity.x) + 
                           PI/2 + radians(sin(frameCount * 0.1) * 15);
        }
    }

    playCollectSound() {
        // Higher pitched buzz sound
        let osc = new p5.Oscillator('square');
        osc.freq(random(400, 600));
        osc.amp(0);
        osc.start();
        osc.amp(0.1, 0.01);
        osc.freq(random(200, 300), 0.1);
        osc.amp(0, 0.1);
        setTimeout(() => osc.stop(), 150);
    }

    playBounceSound() {
        let osc = new p5.Oscillator('sine');
        let freq = random(BOUNCE_FREQUENCIES);
        osc.freq(freq);
        osc.amp(0);
        osc.start();
        osc.amp(0.1, 0.01);
        osc.freq(freq * 0.8, 0.1);  // Frequency sweep down
        osc.amp(0, 0.1);
        setTimeout(() => osc.stop(), 150);
    }

    addSparkle() {
        if (this.sparkles.length < 5) {
            this.sparkles.push({
                x: random(-this.size/2, this.size/2),
                y: random(-this.size/2, this.size/2),
                life: 255
            });
        }
    }

    isDead() {
        if (this.alpha <= 0) {
            return true;
        }
        return false;
    }
}

function setup() {
    // Make canvas fill window
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    createCanvas(canvasWidth, canvasHeight);
    
    // Flip the video input horizontally
    video = createCapture(VIDEO);
    video.size(canvasWidth, canvasHeight);
    video.hide();
    
    const options = {
        withLandmarks: true,
        withDescriptors: false
    };
    
    faceDetector = ml5.faceApi(video, options, modelReady);
    
    difficultyTimer = millis();
    lastSpawnTime = millis();
    
    gameStartTime = millis();
    timeLeft = GAME_DURATION;
}

function modelReady() {
    console.log('Model Ready');
    faceDetector.detect(gotFaces);
}

function gotFaces(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    faces = results;
    faceDetector.detect(gotFaces);
}

function getMouthOpening(face) {
    if (!face.landmarks) return { height: 0, width: 0 };
    const positions = face.landmarks.positions;
    const upperLip = positions[62];
    const lowerLip = positions[66];
    const leftCorner = positions[48];
    const rightCorner = positions[54];
    
    const height = Math.abs(lowerLip._y - upperLip._y);
    const width = Math.abs(rightCorner._x - leftCorner._x);
    
    return { height, width };
}

// Update the drawMouthIndicator function
function drawMouthIndicator(face) {
    if (!face.landmarks) return;
    
    const positions = face.landmarks.positions;
    const mouth = getMouthOpening(face);
    
    // Get exact mouth center position (flipped horizontally)
    const mouthX = width - ((positions[62]._x + positions[66]._x) / 2);  // Flip X coordinate
    const mouthY = (positions[62]._y + positions[66]._y) / 2;
    
    if (mouth.height > CATCH_MOUTH_HEIGHT) {
        // Find target when ready
        if (tongueState === 'ready') {
            let closest = null;
            let minDist = TONGUE_MAX_LENGTH;
            
            for (let token of tokens) {
                if (!token.hasScored) {
                    let d = dist(mouthX, mouthY, token.position.x, token.position.y);
                    if (d < minDist) {
                        minDist = d;
                        closest = token;
                    }
                }
            }
            
            if (closest) {
                tongueTarget = closest;
                tongueState = 'shooting';
                tongueLength = 0;
                tongueStartX = mouthX;  // Store exact mouth position
                tongueStartY = mouthY;
                playShootSound();
            }
        }
        
        // Draw and update tongue
        if (tongueTarget) {
            let targetX = tongueTarget.position.x;
            let targetY = tongueTarget.position.y;
            let angle = atan2(targetY - mouthY, targetX - mouthX);
            
            push();
            stroke(COLORS.tongue);  // Use theme color
            strokeWeight(15);
            noFill();
            
            // Calculate tongue end position based on current length
            let endX = mouthX + cos(angle) * tongueLength;
            let endY = mouthY + sin(angle) * tongueLength;
            
            // Draw elastic tongue with curve
            beginShape();
            for (let i = 0; i <= 10; i++) {
                let t = i / 10;
                let x = lerp(mouthX, endX, t);
                let y = lerp(mouthY, endY, t);
                
                // Add wave effect
                let wave = sin(t * PI + frameCount * 0.2) * 10 * (1 - t);
                x += wave * cos(angle + PI/2);
                y += wave * sin(angle + PI/2);
                
                vertex(x, y);
            }
            endShape();
            
            // Draw tongue tip
            fill(COLORS.tongue);
            noStroke();
            ellipse(endX, endY, 20, 20);
            
            // Update tongue state and handle hits
            if (tongueState === 'shooting') {
                tongueLength += TONGUE_SHOOT_SPEED;
                
                let d = dist(endX, endY, targetX, targetY);
                if (d < TONGUE_HIT_RADIUS) {
                    tongueState = 'retracting';
                    tongueTarget.position = createVector(endX, endY);
                }
                
                if (tongueLength >= TONGUE_MAX_LENGTH) {
                    tongueState = 'retracting';
                }
            } else if (tongueState === 'retracting') {
                tongueLength -= TONGUE_RETRACT_SPEED;
                
                if (tongueTarget.position) {
                    tongueTarget.position.x = endX;
                    tongueTarget.position.y = endY;
                    
                    if (tongueLength < 20) {
                        tokens = tokens.filter(t => t !== tongueTarget);
                        score++;
                        playCatchSound();
                    }
                }
                
                if (tongueLength <= 0) {
                    tongueState = 'ready';
                    tongueTarget = null;
                }
            }
            
            pop();
        }
    }
}

function draw() {
    // Draw video with overlay
    push();
    // First draw the video
    if (video) {
        // Flip video horizontally
        translate(width, 0);
        scale(-1, 1);
        image(video, 0, 0, width, height);
    }
    
    // Add semi-transparent overlay
    translate(width, 0);
    scale(-1, 1);
    fill(...VIDEO_OVERLAY.color, VIDEO_OVERLAY.alpha);
    rect(0, 0, width, height);
    pop();
    
    // Update time
    if (gameState === 'playing') {
        timeLeft = GAME_DURATION - floor((millis() - gameStartTime) / 1000);
        
        // Check for game over
        if (timeLeft <= 0) {
            gameState = 'gameover';
            maxScore = max(maxScore, score);
            playGameOverSound();
            return;  // Exit draw to show game over screen next frame
        }
    }
    
    // Draw game state
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        // Draw game elements
        if (faces.length > 0) {
            drawEyes(faces[0]);
            drawMouthIndicator(faces[0]);
        }
        
        // Update and spawn tokens
        updateAndSpawnTokens();
        
        // Draw UI
        drawGameUI();
        
    } else if (gameState === 'gameover') {
        drawGameOverScreen();
    }
    
    // Always draw sound toggle
    drawSoundToggle();
}

// Add this function to handle token updates and spawning
function updateAndSpawnTokens() {
    // Count falling tokens
    let fallingTokens = tokens.filter(t => !t.grounded).length;
    
    // Spawn new token if we can
    if (millis() - lastSpawnTime > spawnInterval) {
        // Spawn if we have room for more falling tokens
        if (fallingTokens < MAX_FALLING_TOKENS) {
            // Spawn across the width of the screen
            let spawnX = random(100, width - 100);
            tokens.push(new Token(spawnX));
            lastSpawnTime = millis();
            
            // Adjust spawn interval based on level
            spawnInterval = max(
                INITIAL_SPAWN_INTERVAL * pow(0.85, level - 1),
                500  // Don't spawn faster than every 0.5 seconds
            );
        }
    }
    
    // Update and draw all tokens
    for (let token of tokens) {
        token.update();
        token.draw();
    }
    
    // Update buzz sound
    updateBuzzSound();
}

// Add this function to handle game UI
function drawGameUI() {
    push();
    textSize(50);
    textAlign(RIGHT, TOP);
    fill(255);
    stroke(0);
    strokeWeight(4);
    text(`Score: ${score}`, width - 20, 20);
    
    if (timeLeft <= 10) {
        fill(255, 0, 0);
    }
    text(`Time: ${timeLeft}s`, width - 20, 80);
    pop();
}

// Add this function to manage the buzzing sound
function updateBuzzSound() {
    if (!soundEnabled) return;
    if (!faces.length) return;  // No buzzing if no face detected
    
    const face = faces[0];
    if (!face.landmarks) return;
    
    const mouthX = face.landmarks.positions[62]._x;
    const mouthY = face.landmarks.positions[62]._y;
    
    // Find closest fly
    let closestDist = Infinity;
    tokens.forEach(token => {
        if (!token.hasScored) {
            let d = dist(mouthX, mouthY, token.position.x, token.position.y);
            closestDist = min(closestDist, d);
        }
    });
    
    // Start or update buzz based on distance
    if (closestDist < 300) {  // Only buzz when flies are nearby
        if (!buzzOscillator) {
            buzzOscillator = new p5.Oscillator('sawtooth');
            buzzOscillator.freq(BUZZ_FREQUENCY);
            buzzOscillator.amp(0);
            buzzOscillator.start();
        }
        
        // Volume increases as flies get closer
        let volume = map(closestDist, 300, 50, 0, buzzVolume);
        buzzOscillator.amp(volume, 0.1);
        
        // Slight frequency modulation for more natural buzz
        let freqMod = sin(frameCount * 0.1) * 20;
        buzzOscillator.freq(BUZZ_FREQUENCY + freqMod);
    } else if (buzzOscillator) {
        // Stop buzzing when flies are far
        buzzOscillator.amp(0, 0.1);
        setTimeout(() => {
            if (buzzOscillator) {
                buzzOscillator.stop();
                buzzOscillator = null;
            }
        }, 100);
    }
}

// Add these functions for sound effects
function playShootSound() {
    if (!soundEnabled) return;
    let osc = new p5.Oscillator('sine');
    osc.freq(SHOOT_FREQ);
    osc.amp(0);
    osc.start();
    // Quick rise and fall
    osc.amp(0.2, 0.05);
    osc.freq(SHOOT_FREQ * 0.5, 0.1);
    osc.amp(0, 0.1);
    setTimeout(() => osc.stop(), 150);
}

function playCatchSound() {
    if (!soundEnabled) return;
    let osc = new p5.Oscillator('square');
    osc.freq(CATCH_FREQ);
    osc.amp(0);
    osc.start();
    // Pop sound
    osc.amp(0.15, 0.01);
    osc.freq(CATCH_FREQ * 2, 0.05);
    osc.amp(0, 0.1);
    setTimeout(() => osc.stop(), 150);
}

// Update the game over sound function to store the oscillators
function playGameOverSound() {
    if (!soundEnabled) return;
    
    let time = 0;
    GAME_OVER_SOUNDS.frequencies.forEach((freq, i) => {
        setTimeout(() => {
            let osc = new p5.Oscillator(GAME_OVER_SOUNDS.type);
            let lfo = new p5.Oscillator('sine');
            
            gameOverSounds.push({ osc, lfo });  // Store both oscillators
            
            osc.freq(freq);
            osc.amp(0);
            osc.start();
            
            // Add buzzy effect
            lfo.freq(10);
            lfo.amp(5);
            lfo.start();
            
            osc.freq(freq + lfo.amp());
            osc.amp(0.2, 0.05);
            osc.amp(0, GAME_OVER_SOUNDS.durations[i]);
            
            // Clean up after duration
            setTimeout(() => {
                osc.stop();
                lfo.stop();
                // Remove from array when done
                gameOverSounds = gameOverSounds.filter(sound => sound.osc !== osc);
            }, GAME_OVER_SOUNDS.durations[i] * 1000 + 100);
        }, time * 1000);
        time += GAME_OVER_SOUNDS.durations[i];
    });
}

// Add window resize function
function windowResized() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    resizeCanvas(canvasWidth, canvasHeight);
    video.size(canvasWidth, canvasHeight);
}

// Update the keyPressed function to handle sound cleanup
function keyPressed() {
    if (keyCode === 32) {  // SPACE
        // Stop any playing game over sounds
        gameOverSounds.forEach(sound => {
            if (sound.osc) {
                sound.osc.amp(0, 0.1);
                setTimeout(() => sound.osc.stop(), 100);
            }
            if (sound.lfo) {
                sound.lfo.amp(0, 0.1);
                setTimeout(() => sound.lfo.stop(), 100);
            }
        });
        gameOverSounds = [];  // Clear the array
        
        if (gameState === 'start') {
            // Start new game immediately
            startScreenFly = null;
            gameState = 'playing';
            score = 0;
            level = 1;
            timeLeft = GAME_DURATION;
            gameStartTime = millis();
            tokens = [];
            
            // Stop start screen buzz if it exists
            if (startScreenBuzz) {
                startScreenBuzz.amp(0, 0.1);
                setTimeout(() => {
                    startScreenBuzz.stop();
                    startScreenBuzz = null;
                }, 100);
            }
        } else if (gameState === 'playing' || gameState === 'gameover') {
            // Reset to start screen
            gameState = 'start';
            
            // Reset all game variables
            score = 0;
            level = 1;
            fallSpeed = 1;
            spawnInterval = INITIAL_SPAWN_INTERVAL;
            timeLeft = GAME_DURATION;
            gameStartTime = millis();
            difficultyTimer = millis();
            lastSpawnTime = millis();
            tokens = [];
            
            // Clean up any active sounds
            if (buzzOscillator) {
                buzzOscillator.amp(0, 0.1);
                setTimeout(() => {
                    buzzOscillator.stop();
                    buzzOscillator = null;
                }, 100);
            }
            
            // Create new demo fly for start screen
            startScreenFly = null;  // Will be created in next drawStartScreen
        }
    }
}

// Helper function to draw stars
function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle/2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a+halfAngle) * radius1;
        sy = y + sin(a+halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

// Update eye drawing function
function drawEyes(face) {
    const positions = face.landmarks.positions;
    
    // Get actual eye positions from face landmarks and flip X coordinates
    const leftEyePos = {
        x: width - ((positions[37]._x + positions[41]._x) / 2),  // Flip X coordinate
        y: (positions[37]._y + positions[41]._y) / 2
    };
    
    const rightEyePos = {
        x: width - ((positions[44]._x + positions[46]._x) / 2),  // Flip X coordinate
        y: (positions[44]._y + positions[46]._y) / 2
    };
    
    // Calculate eye size based on face size
    const faceWidth = abs(positions[16]._x - positions[0]._x);
    const eyeSize = faceWidth * 0.25;
    
    // Find closest fly for each eye
    function findClosestFly(eyePos) {
        let closestDist = Infinity;
        let closestFly = null;
        
        tokens.forEach(fly => {
            if (!fly.hasScored) {
                let d = dist(eyePos.x, eyePos.y, fly.position.x, fly.position.y);
                if (d < closestDist) {
                    closestDist = d;
                    closestFly = fly;
                }
            }
        });
        
        return { fly: closestFly, distance: closestDist };
    }
    
    // Get closest flies for each eye
    const leftClosest = findClosestFly(leftEyePos);
    const rightClosest = findClosestFly(rightEyePos);
    
    // Draw each eye
    for (let isLeft of [true, false]) {
        const eyePos = isLeft ? leftEyePos : rightEyePos;
        const closest = isLeft ? leftClosest : rightClosest;
        
        push();
        translate(eyePos.x, eyePos.y);
        
        // Calculate rotation based on closest fly
        if (closest.fly && closest.distance < 300) {
            let angle = atan2(
                closest.fly.position.y - eyePos.y,
                closest.fly.position.x - eyePos.x
            );
            rotate(angle);
        } else {
            // Wander when no fly is close
            let wanderSpeed = 0.02;
            let wanderAmount = PI/4;
            rotate(sin(frameCount * wanderSpeed + (isLeft ? 0 : PI)) * wanderAmount);
        }
        
        // Draw eye parts
        fill(COLORS.eyes.white);
        stroke(COLORS.eyes.outline);
        strokeWeight(4);
        ellipse(0, 0, eyeSize, eyeSize);
        
        fill(COLORS.eyes.iris);
        noStroke();
        ellipse(eyeSize/4, 0, eyeSize * 0.6, eyeSize * 0.6);
        
        fill(COLORS.eyes.pupil);
        ellipse(eyeSize/4, 0, eyeSize * 0.3, eyeSize * 0.3);
        pop();
    }
}

// Add this function for the start screen
function drawStartScreen() {
    // Dark background
    background(COLORS.background);
    
    let centerX = width/2;
    let centerY = height/2;
    
    // Title with warm glow
    textAlign(CENTER, CENTER);
    textSize(100);  // Bigger size for main title
    fill(COLORS.title);
    stroke(0);
    strokeWeight(4);
    text("TongueZap", centerX, centerY - 300);
    
    // Subtitle
    textSize(40);
    fill(COLORS.instructions.line1);
    noStroke();
    text("The Hungry Chameleon Experience", centerX, centerY - 240);
    
    // Main instructions with new color palette
    textSize(50);
    noStroke();
    
    // First line in light blue
    fill(COLORS.instructions.line1);
    text("open your mouth to shoot tongue", centerX, centerY + 100);
    
    // Second line in coral
    fill(COLORS.instructions.line2);
    text("eat as many flies as you can", centerX, centerY + 160);
    
    // Third line in mint green
    fill(COLORS.instructions.line3);
    text("in one minute!", centerX, centerY + 220);
    
    // Draw animated chameleon eyes - make them larger
    let eyeSize = width * 0.12;  // Increased from 0.08 to 0.12
    let eyeSpacing = eyeSize * 2.5;  // Adjusted spacing for larger eyes
    
    // Draw eyes with independent tracking
    for (let isLeft of [true, false]) {
        let eyeX = centerX + (isLeft ? -eyeSpacing/2 : eyeSpacing/2);
        let eyeY = centerY - 100;
        
        // Calculate distance from this eye to fly
        let distToFly = startScreenFly ? 
            dist(eyeX, eyeY, startScreenFly.position.x, startScreenFly.position.y) : 
            Infinity;
        
        push();
        translate(eyeX, eyeY);
        
        // Track fly if it's close to this eye
        if (startScreenFly && distToFly < 200) {
            let angle = atan2(
                startScreenFly.position.y - eyeY,
                startScreenFly.position.x - eyeX
            );
            rotate(angle);
        } else {
            // Wander when fly is far from this eye
            let wanderSpeed = 0.02;
            let wanderAmount = PI/4;
            rotate(sin(frameCount * wanderSpeed + (isLeft ? 0 : PI)) * wanderAmount);
        }
        
        // Eye white
        fill(COLORS.eyes.white);
        stroke(COLORS.eyes.outline);
        strokeWeight(4);
        ellipse(0, 0, eyeSize, eyeSize);
        
        // Turquoise iris
        fill(COLORS.eyes.iris);
        noStroke();
        ellipse(eyeSize/4, 0, eyeSize * 0.6, eyeSize * 0.6);
        
        // Dark pupil
        fill(COLORS.eyes.pupil);
        ellipse(eyeSize/4, 0, eyeSize * 0.3, eyeSize * 0.3);
        pop();
    }
    
    // Create and update demo fly - drawn last to be on top
    if (!startScreenFly) {
        startScreenFly = new Token(centerX);
        startScreenFly.position = createVector(centerX, centerY);
        startScreenFly.velocity = createVector(random(-2, 2), random(-2, 2));
        startScreenFly.noiseOffsetX = random(1000);
        startScreenFly.noiseOffsetY = random(1000);
    }
    
    // More organic fly movement across entire canvas
    let noiseX = noise(startScreenFly.noiseOffsetX) * 2 - 1;
    let noiseY = noise(startScreenFly.noiseOffsetY) * 2 - 1;
    
    // Update noise offsets
    startScreenFly.noiseOffsetX += 0.01;
    startScreenFly.noiseOffsetY += 0.1;
    
    // Add noise to velocity
    startScreenFly.velocity.x += noiseX * 0.5;
    startScreenFly.velocity.y += noiseY * 0.5;
    
    // Keep fly in canvas bounds with larger area
    let margin = 100;
    if (startScreenFly.position.x < margin) startScreenFly.velocity.x += 0.5;
    if (startScreenFly.position.x > width - margin) startScreenFly.velocity.x -= 0.5;
    if (startScreenFly.position.y < margin) startScreenFly.velocity.y += 0.5;
    if (startScreenFly.position.y > height - margin) startScreenFly.velocity.y -= 0.5;
    
    // Limit velocity
    startScreenFly.velocity.limit(4);  // Slightly faster
    
    // Update position
    startScreenFly.position.add(startScreenFly.velocity);
    
    // Update rotation based on movement
    startScreenFly.rotation = atan2(startScreenFly.velocity.y, startScreenFly.velocity.x) + 
                             PI/2 + sin(frameCount * 0.1) * 0.3;
    
    // Draw the fly
    startScreenFly.draw();
    
    // Start prompt with warm glow
    textSize(50);
    fill(COLORS.startPrompt);
    if (sin(frameCount * 0.05) > 0) {
        text("Press SPACE to Start", centerX, centerY + 300);
    }
    
    // Add credits at the bottom
    textSize(16);
    fill(COLORS.instructions.line1);
    noStroke();
    text("Concept and Programming by Marlon Barrios Solano © 2025", centerX, height - 60);
    
    // Add clickable link
    let linkText = "marlonbarrios.github.io";
    let linkWidth = textWidth(linkText);
    let linkX = centerX - linkWidth/2;
    let linkY = height - 35;
    
    // Draw link text
    fill(COLORS.title);  // Use hunyadi-yellow for the link
    text(linkText, centerX, linkY);
    
    // Add underline effect
    stroke(COLORS.title);
    strokeWeight(1);
    line(linkX, linkY + 3, linkX + linkWidth, linkY + 3);
    
    // Check for mouse hover over link
    if (mouseX > linkX && mouseX < linkX + linkWidth &&
        mouseY > linkY - 10 && mouseY < linkY + 10) {
        cursor(HAND);  // Show hand cursor on hover
    } else {
        cursor(ARROW);
    }
    
    // Update demo fly buzz sound
    if (soundEnabled && !startScreenBuzz) {
        startScreenBuzz = new p5.Oscillator('sawtooth');
        startScreenBuzz.freq(220);
        startScreenBuzz.amp(0);
        startScreenBuzz.start();
    }
    
    if (startScreenBuzz && soundEnabled) {
        // Buzz volume based on fly position
        let centerDist = dist(startScreenFly.position.x, startScreenFly.position.y, 
                            centerX, centerY);
        let volume = map(centerDist, 300, 50, 0, 0.05);
        volume = constrain(volume, 0, 0.05);
        startScreenBuzz.amp(volume, 0.1);
        
        // Modulate frequency for more natural buzz
        let freqMod = sin(frameCount * 0.1) * 20;
        startScreenBuzz.freq(220 + freqMod);
    }
    
    // Draw sound toggle
    drawSoundToggle();
}

// Update drawSoundToggle function to position button at bottom right
function drawSoundToggle() {
    push();
    // New position at bottom right with some padding
    let x = width - 60;
    let y = height - 60;  // Changed from 30 to height - 60
    
    // Button background
    noStroke();
    fill(...COLORS.soundButton.background, 150);
    rect(x - 25, y - 25, 50, 50, 10);
    
    // Sound icon
    if (soundEnabled) {
        fill(COLORS.soundButton.icon);
        stroke(COLORS.soundButton.icon);
    } else {
        fill(COLORS.soundButton.muted);
        stroke(COLORS.soundButton.muted);
    }
    strokeWeight(2);
    
    // Speaker icon
    fill(255);
    rect(x - 10, y - 8, 8, 16);
    noFill();
    beginShape();
    vertex(x, y - 12);
    vertex(x + 8, y - 15);
    vertex(x + 8, y + 15);
    vertex(x, y + 12);
    endShape();
    // Sound waves
    arc(x + 8, y, 12, 20, -PI/3, PI/3);
    arc(x + 8, y, 18, 30, -PI/3, PI/3);
    pop();
}

// Update mousePressed function to match new button position
function mousePressed() {
    // Check if click is on sound toggle
    let x = width - 60;
    let y = height - 60;  // Changed from 30 to height - 60
    if (mouseX > x - 25 && mouseX < x + 25 && 
        mouseY > y - 25 && mouseY < y + 25) {
        soundEnabled = !soundEnabled;
        
        // Stop all sounds when muted
        if (!soundEnabled) {
            if (startScreenBuzz) {
                startScreenBuzz.amp(0, 0.1);
                setTimeout(() => {
                    startScreenBuzz.stop();
                    startScreenBuzz = null;
                }, 100);
            }
            if (buzzOscillator) {
                buzzOscillator.amp(0, 0.1);
                setTimeout(() => {
                    buzzOscillator.stop();
                    buzzOscillator = null;
                }, 100);
            }
        }
        return false;  // Prevent default
    }
    
    // Check for link click
    let linkText = "marlonbarrios.github.io";
    let linkWidth = textWidth(linkText);
    let linkX = width/2 - linkWidth/2;
    let linkY = height - 35;
    
    if (mouseX > linkX && mouseX < linkX + linkWidth &&
        mouseY > linkY - 10 && mouseY < linkY + 10) {
        window.open('https://marlonbarrios.github.io/', '_blank');
        return false;
    }
}

// Add this function to handle game over screen separately
function drawGameOverScreen() {
    push();
    // Dark overlay with themed color
    let alpha = map(sin(frameCount * 0.05), -1, 1, 180, 220);
    fill(...COLORS.background, alpha);
    rect(0, 0, width, height);
    
    let centerX = width/2;
    let centerY = height/2;
    
    // Score display with theme colors
    textAlign(CENTER, CENTER);
    textSize(80);
    
    // Animated color transition between theme colors
    let t = (sin(frameCount * 0.05) + 1) / 2;
    let scoreColor = lerpColor(
        color(...COLORS.title),
        color(...COLORS.instructions.line3),
        t
    );
    
    fill(scoreColor);
    stroke(COLORS.eyes.outline);
    strokeWeight(4);
    
    // Bouncing score animation
    let bounce = sin(frameCount * 0.1) * 20;
    text(`${score} Flies Caught!`, centerX, centerY + bounce);
    
    // Celebratory flies circling the score
    for (let i = 0; i < 8; i++) {
        let angle = frameCount * 0.1 + i * TWO_PI/8;
        let radius = 150 + sin(frameCount * 0.05 + i) * 30;
        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius + bounce;
        
        // Draw celebratory fly
        push();
        translate(x, y);
        rotate(angle + PI/2);
        
        // Wing animation
        let wingAngle = sin(frameCount * 0.3 + i) * 30;
        
        // Draw wings with theme colors
        fill(...COLORS.eyes.white, 200);
        noStroke();
        
        // Left wing
        push();
        rotate(radians(-20 + wingAngle));
        ellipse(-10, 0, 20, 8);
        pop();
        
        // Right wing
        push();
        rotate(radians(20 - wingAngle));
        ellipse(10, 0, 20, 8);
        pop();
        
        // Body with theme colors
        fill(...COLORS.instructions.line2);
        noStroke();
        ellipse(0, 0, 12, 15);
        
        fill(...COLORS.instructions.line1);
        ellipse(0, -5, 8, 8);
        
        // Eyes with theme color
        fill(...COLORS.instructions.line3);
        ellipse(-2, -6, 3, 3);
        ellipse(2, -6, 3, 3);
        pop();
    }
    
    // Restart prompt with theme colors and glow
    textSize(40);
    let glowAlpha = map(sin(frameCount * 0.1), -1, 1, 150, 255);
    fill(...COLORS.title, glowAlpha);
    stroke(COLORS.eyes.outline);
    strokeWeight(2);
    text('Press SPACE to try again', centerX, centerY + 150);
    
    pop();
} 