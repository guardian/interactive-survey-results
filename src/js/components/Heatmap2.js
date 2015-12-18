export default class Heatmap {

	constructor(data,options) {
		this.options=options;
		this.questions=options.questions;
		
		this._setExents(this.data);
		
		this.data=data;

		this.margins={
			top:20,
			bottom:20,
			left:20,
			right:20
		}

		this.container=d3.select(options.container)
				.append("div")
					.attr("class","heatmap")

		this._buildVisual();
	}
	_resize() {
		//var clrScale = { name: 'guardianBrand', selected: '#b0e3ff', scale: ['#005689','#4982b9','#7db2ec','#b0e3ff'] };
		//var clrScale = { name: 'featuresSupport1', selected: '#951c55', scale: ['#250000','#370000','#62002c','#951c55','#c95181','#ff82b1','#ffb4e3'] };
	}
	_buildVisual() {
		let self=this;
		this.colorscales={
			"mean":d3.scale.quantize().domain([0,36]).range(['#951c55','#c95181','#ff82b1','#ffb4e3']),
			"gnm":d3.scale.quantize().domain([0,36]).range(['#005689','#4982b9','#7db2ec','#b0e3ff']),
			"font":d3.scale.linear().domain([17,18]).range(["#fff","#000"]),
		};
		d3.range(36)
		let table=this.container.append("table"),
			thead=table.append("thead").append("tr"),
			tbody=table.append("tbody");
		
		let legend=this.container.append("div");
		new Legend(this.colorscales,{
			container:legend
		});

		thead.selectAll("th")
				.data((["country"]).concat(this.questions.sort((a,b)=>{
	                return a.index-b.index;
	            })))
				.enter()
				.append("th")
					.text((d)=>{
						if(d==="country") {
							return "";
						}
						//console.log(d)
						return (d.index+1)
					})

		let tr=tbody.selectAll("tr")
				.data(this.data.sort((a,b)=>{
					return b.values[0].n - a.values[0].n
				}))
				.enter()
				.append("tr");

		tr.append("th")
			.text((d)=>d.key)

		let td=tr.selectAll("td")
			.data((d)=>d.values.sort((a,b)=>{
                let indexA=this.questions.find((q)=>(q.id===a.question)).index,
                    indexB=this.questions.find((q)=>(q.id===b.question)).index;
                return indexA-indexB;
            }))
			.enter()
			.append("td");

		td
			.filter((d)=>(d.mean!=="--"))
			.append("div")
				.classed("nd",(d)=>(d.mean==="--"))
				.style("background-color",(d)=>{
					let diff_mean=Math.abs(d.mean-d.actual),
						diff_gnm=Math.abs(d.gnm-d.actual);
					return this.colorscales[diff_mean<diff_gnm?"mean":"gnm"](Math.min(diff_mean,diff_gnm))
				})
				.on("touchstart",(d)=>{
					//d.chart.setLeft(this.getBoundingClientRect().left);
				})
				.each(function(d){
					//console.log(d)
					d.chart=new TinyChart(d,{
						container:d3.select(this).append("div").attr("class","tiny-chart").node(),
						colorscales:self.colorscales,
						question:self.questions.find((q)=>(q.id===d.question)),
						left:this.getBoundingClientRect().left,
						parent_container:self.container
					})
				})
				.append("b")
					.style("color",(d)=>{
						//return "#fff";
						let diff_mean=Math.abs(d.mean-d.actual),
							diff_gnm=Math.abs(d.gnm-d.actual);
						return this.colorscales["font"](Math.min(diff_mean,diff_gnm));//diff_mean<diff_gnm?diff_mean:diff_gnm)
					})
					.html((d)=>{
						
						let question=this.questions.find((q)=>(q.id===d.question));
						//console.log(question)
						if(d.mean==="--") {
							return "";
						}
						let diff_mean=Math.abs(d.mean-d.actual),
							diff_gnm=Math.abs(d.gnm-d.actual),
							value=diff_gnm<diff_mean?diff_gnm:diff_mean;
						let unit=`<span>${question.range?"":"%"}</span>`
						if(value<1) {
							return "<1"+unit;
						}
						return d3.format(",.0f")(value)+unit;
					})
							
				


	}
	_setExents() {
		this.extents={
			values:[0,100]
		}
	}
}
class Legend {
	constructor(scales,options) {
		this.scales=scales;
		
		this.container=options.container;
		
		this._buildVisual();
	}
	_buildVisual() {
		this.container
			.attr("class","legend")

		console.log(this.scales.mean.range().concat(this.scales.gnm.range()))

		let titles=this.container.append("div")
						.attr("class","titles");
		titles.append("span").text("Surveyed people did better")
		titles.append("span").text("Guardian readers did better")

		let color_list={
			mean:this.scales.mean.range().map((c,i)=>{
				let txt="";
				if(i===0) {
					txt="Accurate";
				}
				if(i===this.scales.mean.range().length-1) {
					txt="Wrong";
				}
				
				return {
					middle:i===0,
					group:i===1 || i===2,
					color:c,
					text:txt
				}
			}),
			gnm:this.scales.gnm.range().map((c,i)=>{
				let txt="";
				
				if(i===this.scales.gnm.range().length-1) {
					txt="Wrong";
				}
				
				return {
					color:c,
					group:i===1 || i===2,
					text:txt
				}
			})
		};

		let colors=this.container.append("ul")
						.selectAll("li")
						.data(color_list.mean.reverse().concat(color_list.gnm))
						.enter()
						.append("li")
							.classed("middle",(d)=>d.middle)

		colors.append("span")
				.style("background-color",(d)=>d.color)
		colors.append("b")
				.classed("middle",(d)=>d.middle)
				.classed("group",(d,i)=>d.group)
				.text((d)=>d.text)
	}


}
class TinyChart {
	constructor(data,options) {
		this.data=data;
		this.options=options;
		this.container=d3.select(options.container);
		this.margins={
			top:20,
			bottom:25,
			left:40,
			right:40
		}
		this._buildVisual();
	}
	_buildVisual() {
		//let WIDTH=110,
		//	HEIGHT=60;



		let dim=this.container.node().getBoundingClientRect(),
			WIDTH=dim.width,
			HEIGHT=dim.height-30;

		this.yscale=d3.scale.linear().domain([100,0]).range([0,HEIGHT-(this.margins.top+this.margins.bottom)]);
		this.xscale=d3.scale.ordinal().domain(["mean","actual","gnm"]).rangePoints([0,WIDTH-(this.margins.left+this.margins.right)]);
		//console.log(this.options.question)
		let parent_width=this.options.parent_container.node().getBoundingClientRect().width;
		let delta=parent_width - (this.options.left+190);
		console.log(parent_width)
		if(delta<0 && parent_width<620) {
			this.container.style("left",delta+"px")
		}
		


		this.container.append("p")
				.html((d)=>{
					let how="did OK";
					let diff_mean=Math.abs(d.mean-d.actual),
						diff_gnm=Math.abs(d.gnm-d.actual);

					if(diff_mean<diff_gnm) {
						how="did worse than the public";
					}
					if(diff_gnm>20) {
						how=" were way off the mark"
					}
					if(diff_gnm<8) {
						how=" were quite close"
					}
					if(diff_gnm<4) {
						how=" were close"
					}
					if(diff_gnm<1) {
						how=" were very accurate"
					}

					return `In question ${this.options.question.index+1} for ${this.data.country}, the Guardian readers ${how}`
				})

		this.svg=this.container.append("svg")

		
		
		let g=this.svg.append("g")
				.attr("class","values")
				.attr("transform",`translate(${this.margins.left},${this.margins.top})`);
		
		g.append("line")
				.attr("class","actual")
				.attr("x1",this.xscale("mean"))
				.attr("x2",this.xscale("gnm"))
				.attr("y1",this.yscale(this.data.actual))
				.attr("y2",this.yscale(this.data.actual))

		let value=g.selectAll("g.value")
			.data(["mean","actual","gnm"])
			.enter()
				.append("g")
				.attr("class","value");
		
		value
			.filter((d)=>{
				return (["mean","gnm"]).indexOf(d)>-1
			})
			.append("path")
			.attr("class",(d)=>d+" connecting")
				.attr("d",(d)=>{
					let x1=this.xscale(d),
						y1=this.yscale(this.data[d]),
						x2=this.xscale("actual"),
						y2=this.yscale(this.data["actual"]);

					return `M${x1},${y1}L${x2},${y2}L${x1},${y2}Z`
				})
				.style("fill",(d)=>{
					let diff=Math.abs(this.data[d]-this.data.actual)
					//console.log(this.options)
					return this.options.colorscales[d](diff)
				})

		value
			.filter((d)=>{
				return (["mean","gnm"]).indexOf(d)>-1
			})
			.append("line")
				.attr("class",(d)=>d+" connecting")
				.attr("x1",(d)=>{
					return this.xscale(d)
				})
				.attr("x2",this.xscale("actual"))
				.attr("y1",(d)=>{
					return this.yscale(this.data[d])
				})
				.attr("y2",this.yscale(this.data["actual"]))

		value.append("text")
				.attr("class","header")
				.attr("x",(d)=>{
					return this.xscale(d)
				})
				.attr("y",this.yscale.range()[1])
				.attr("dy",8)
				.text(d=>{
					if(d==="mean") {
						return this.data.country;//"People"
					}
					if(d==="actual") {
						//console.log("!!!!!",this.data)
						return "Actual"
					}
					return "Guardian"
				})

		value
			.filter((d)=>(d==="actual"))
			.append("text")
				.attr("class","header")
				.attr("x",(d)=>{
					return this.xscale(d)
				})
				.attr("y",0)
				.attr("dy",-5)
				.text(100+(this.options.question.range?"":"%"))

		value.append("line")
				.attr("class","bg")
				.attr("x1",(d)=>{
					return this.xscale(d)
				})
				.attr("x2",(d)=>{
					return this.xscale(d)
				})
				.attr("y1",this.yscale.range()[0])
				.attr("y1",this.yscale.range()[1])

		value.append("circle")
				.attr("class",(d)=>d)
				.attr("cx",(d)=>{
					return this.xscale(d)
				})
				.attr("cy",(d)=>{
					return this.yscale(this.data[d])
				})
				.attr("r",2)

		
		value.append("text")
				.attr("class",(d)=>d)
				.attr("dx",(d)=>{
					if(d==="mean") {
						return -4;
					}
					if(d==="actual") {
						return 0;
					}
					if(d==="gnm") {
						return 4;
					}
				})
				.attr("dy",(d)=>{

					if(d==="actual") {
						if(this.data["gnm"]>this.data["actual"]) {
							return -5;
						}
						return 12;
					}
					return "0.25em";
					
				})
				.attr("x",(d)=>{
					return this.xscale(d)
				})
				.attr("y",(d)=>{
					return this.yscale(this.data[d])
				})
				.text((d)=>{
					return d3.format(",.0f")(this.data[d])+(this.options.question.range?"":"%")
				})
	
	}
}