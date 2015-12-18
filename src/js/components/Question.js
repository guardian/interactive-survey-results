import Chart from './Chart.js';

export default class Question {

	constructor(data,options) {
		this.options=options;
		this.question=options.question;
		this.data=data;

		this._setExents(this.data);
		//console.log(this.extents)

		this.container=d3.select(options.container)

		this._buildVisual();
	}
	_resize() {
		
	}
	_buildVisual() {

		let self=this;

		this.margins={
			top:20,
			left:20,
			bottom:20,
			right:20
		}
		
		
		this.container.append("p")
						.html("<i>"+(this.question.index+1)+".</i> "+this.question.question)

		let country=this.container.append("ul")
							.selectAll("li")
								.data(this.data.values
										.filter((d)=>(d.mean!=="--"))
										.sort((a,b)=>{
											return a.gnm_diff - b.gnm_diff
										})
								)
								.enter()
								.append("li");

		country.append("h3")
					.text((d)=>d.country)

		country.append("div")
					.attr("class","chart")
					.each(function(d){
						new Chart(d,{
							container:this,
							extents:self.extents
						})
					})
		let format=d3.format(",.2f");
		country.append("span")
				.attr("class","diff mean")
				.classed("better",(d)=>(d.gnm_diff>d.diff))
				.text((d)=>format(d.diff))

		country.append("span")
				.attr("class","diff gnm")
				.classed("better",(d)=>(d.gnm_diff<d.diff))
				.text((d)=>format(d.gnm_diff))

		country.append("span")
				.attr("class","num")
				.text((d)=>d3.format(",.0d")(d.n))

	}
	_setExents() {
		this.extents={
			values:[0,100]
		}
	}
}