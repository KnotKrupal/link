(function(){
	var canvasBody = document.getElementById("canvas"),
			canvas = canvasBody.getContext("2d"),

			w = canvasBody.width = window.innerWidth,
			h = canvasBody.height = window.innerHeight,

			tick = 0,
			wireInfos = [{
					start: {
						x: 0,
						y: -100
					},
					end: {
						x: w,
						y: h/10,
					},
					middle: {
						x: w/2,
						y: h/7
					},
					strokeWidth: 4,
					color: "#fcfcfc",
					stripeSwitchTime: 5 },
				{
					start: {
						x: 0,
						y: h/2.3
					},
					end: {
						x: w,
						y: h/11
					},
					middle: {
						x: w/2,
						y: h/1.5
					},
					strokeWidth: 3,
					color: "#fcfcfc",
					stripeSwitchTime: 10 },
				{
					start: {
						x: 0,
						y: 100,
					},
					end: {
						x: w,
						y: h/2
					},
					middle: {
						x: w/2,
						y: h/2.3
					},
					stripeSwitchTime: 50
			}],
			opts = {
				canvas: {
					backgroundColor: "#222",
					wireAmount: 1
				},
				wire: {
					spacing: 50,
					wireDistance: 25
				},
				particle: {
					minSize: 10,
					addedSize: 5,

					minShadowBlur: 15,
					addedShadowBlur: 20,

					offShadowBlur: 10,
					offShadowColor: "rgba(5,5,5,0.5)"
				},

			},
			Colors = [
				"#2ecc71", //green
				"#3498db", //blue
				"#9b59b6", //purple
				"#e74c3c", //red
				"#f1c40f" //yellow
			],
			wires = [],
			Wire = function(obj){
				this.stripeOrder = true;
				this.stripeSwitchTime = 200;
				this.stripeSwitch = function(){
					this.stripeOrder ? this.stripeOrder = false : this.stripeOrder = true;
				};
				this.init = function(obj){
					this.x1 = obj.start.x;
					this.x2 = obj.middle.x;
					this.x3 = obj.end.x;
					this.y1 = obj.start.y;
					this.y2 = obj.middle.y;
					this.y3 = obj.end.y;
					this.strokeWidth = obj.strokeWidth;
					this.strokeColor = obj.color;
					this.stripeSwitchTime = obj.stripeSwitchTime;
					this.points = [];
					this.wireDistance = opts.wire.wireDistance;
					this.flatLength = Math.sqrt( Math.pow(this.y3 - this.y1, 2) + Math.pow(this.x3 - this.x1, 2) );
					//WARNING!!! REALLY COMPLICATED!
					var A = ((this.y2 - this.y1)*(this.x1 - this.x3) + (this.y3-this.y1)*(this.x2-this.x1)) / ( (this.x1 - this.x3)*(Math.pow(this.x2, 2) - Math.pow(this.x1, 2)) + (this.x2 - this.x1)*(Math.pow(this.x3, 2) - Math.pow(this.x1, 2) ) ),
							B = ( (this.y2 - this.y1) - A*(this.x2*this.x2 - this.x1*this.x1) ) / (this.x2 - this.x1),
							C = (this.y1 - A*this.x1*this.x1 - B*this.x1);
					this.equation = function(x){ return A*x*x + B*x + C;};
					this.bulbs = [];
					var bulbAmount = this.flatLength / opts.wire.spacing;
					for(var i = 0; i < bulbAmount; i++){
						this.bulbs.push( new Bulb(i*opts.wire.spacing, this.equation(i*opts.wire.spacing) + this.wireDistance, this.wireDistance) );
					}
				};
				this.render = function(obj){
					//first rendering the bulbs
					if(!obj){
						for(var i = 0; i < this.bulbs.length; i++){
							this.bulbs[i].render({
								status: "on"
							});
						}
					} else {
						if(obj.style == ""){
							for(var i = 0; i < this.bulbs.length; i++){
								this.bulbs[i].render({
									status: "on"
								});
							}
						}
						if(obj.style == "stripe"){
							for(var i = this.stripeOrder ? 1 : 0; i < this.bulbs.length; i+=2){
								this.bulbs[i].render({
									status: "on"
								});
								if(i > 0 && i + 1< this.bulbs.length){
									this.bulbs[i + 1].render({
										status: "off"
									});
								}
							}
						}
					}
					//BETTER DON'T TOUCH ANYTHING IN THIS METHOD AFTER THIS LINE
					//pushing the points of the line. Better don't touch. Freaking stupidness
          this.points = [];
					for(var i = 0; i < this.flatLength; i++){
						this.points.push([i, this.equation(i)]);
					}
					//The rendering of the freaking points of the line. THESE ARE NOT BULBS! THIS THIS THING IS THE LINE, THE WIRE
					for(var i = 0; i < this.points.length - 1; i++){
						canvas.beginPath();
						canvas.moveTo(this.points[i][0], this.points[i][1]);
						canvas.lineTo(this.points[i + 1][0], this.points[i + 1][1]);
						canvas.lineWidth = this.strokeWidth;
						canvas.strokeStyle = this.strokeColor;
						canvas.stroke();
					};
				};
			},
			Bulb = function(Xpos, Ypos, wireDistance){
				this.x = Xpos;
				this.y = Ypos;
				this.wireDistance = wireDistance;
				this.radius = opts.particle.minSize + Math.random()*opts.particle.addedSize;
				this.color = Colors[Math.floor(Math.random()*Colors.length)];
				this.shadowBlur = opts.particle.minShadowBlur + Math.random()*opts.particle.addedShadowBlur;
				this.render = function(obj){
					this.shadowBlur = opts.particle.minShadowBlur + Math.random()*opts.particle.addedShadowBlur;
					//Drawing line
					canvas.beginPath();
					canvas.moveTo(this.x, this.y);
					canvas.lineTo(this.x, this.y - this.wireDistance);
					canvas.closePath();
					canvas.strokeStyle = opts.wire.color;
					canvas.stroke();

					//Drawing bulb
					if(obj.status == "on"){
						canvas.beginPath();
						canvas.arc(this.x, this.y, this.radius, 0, Math.PI*2);
						canvas.closePath();
						canvas.shadowBlur = this.shadowBlur;
						canvas.shadowColor = this.color;
						canvas.fillStyle = this.color;
						canvas.fill();
						canvas.shadowBlur = 0;
						canvas.shadowColor = "rgba(0,0,0,0)";
					}
					else if(obj.status == "off"){
						canvas.beginPath();
						canvas.arc(this.x, this.y, this.radius, 0, Math.PI*2);
						canvas.closePath();
						canvas.shadowBlur = opts.particle.offShadowBlur;
						canvas.shadowColor = opts.particle.offShadowColor;
						canvas.fillStyle = opts.canvas.backgroundColor;
						canvas.fill();
						canvas.shadowBlur = 0;
						canvas.shadowColor = "rgba(0,0,0,0)";
					}
				};
			};

	function setup(){
		for(var i = 0; i < wireInfos.length; i++){
			wires[i] = new Wire();
			wires[i].init(wireInfos[i]);
		}
		window.requestAnimationFrame(loop);
	};
	function loop(){
		canvas.fillStyle = opts.canvas.backgroundColor;
		canvas.fillRect(0,0,w,h);
		tick++;
		wires.map( function( Wire ){
			Wire.render({
				style: "stripe",
				tick: tick
			});
			tick%Wire.stripeSwitchTime == 0 ? Wire.stripeSwitch() : true
		})

		window.requestAnimationFrame(loop);
	};
	setup();

	window.addEventListener("resize", function(){
		w = canvasBody.width = window.innerWidth;
		h = canvasBody.height = window.innerHeight;
	});
})();