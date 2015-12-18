export default class Chart {

	constructor(data,options) {
		this.options=options;
		this.question=options.question;
		this.extents=options.extents;
		this.data=data;

		this.margins={
			top:0,
			bottom:0,
			left:20,
			right:20
		}

		this.container=d3.select(options.container)

		this._buildVisual();
	}
	_resize() {
		
	}
	_buildVisual() {

		this.svg=this.container.append("svg");

		let dim = this.svg.node().getBoundingClientRect();

		this.width=dim.width;
		this.height=dim.height;

		this.xscale=d3.scale.linear().domain(this.extents.values).range([0,this.width-(this.margins.left+this.margins.right)])

		let chart=this.svg.append("g")
					.attr("transform",`translate(${this.margins.left},${this.height/2})`)
				
		chart.append("line")
				.attr("class","bg")
				.attr("x1",this.xscale.range()[0])
				.attr("x2",this.xscale.range()[1])
				.attr("y1",0)
				.attr("y2",0)

		
		//MEAN
		this.mean=chart.append("g")
						.attr("class","mean")
						.attr("transform",(d)=>(`translate(${this.xscale(d.mean)},0)`))

		this.mean.append("line")
					.attr("x1",0)
					.attr("x2",(d)=>{
						return -(this.xscale(d.mean) - this.xscale(d.actual))
					})
					.attr("y1",0)
					.attr("y2",0)
		this.mean.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",3)

		//GNM
		this.gnm=chart.append("g")
						.attr("class","gnm")
						.attr("transform",(d)=>(`translate(${this.xscale(d.gnm)},0)`))
		this.gnm.append("line")
					.attr("x1",0)
					.attr("x2",(d)=>{
						return -(this.xscale(d.gnm) - this.xscale(d.actual))
					})
					.attr("y1",0)
					.attr("y2",0)
		this.gnm.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",3)

		//ACTUAL
		this.actual=chart.append("g")
						.attr("class","actual")
						.attr("transform",(d)=>(`translate(${this.xscale(d.actual)},0)`))
		this.actual.append("line")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",-7)
				.attr("y2",6)

	}

}