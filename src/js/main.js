import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/main.html!text'

import questions from '../assets/data/questions.json!json';
import results from '../assets/data/results.json!json';
import median from '../assets/data/median.json!json';

import d3 from 'd3';

//import Question from './components/Question.js';
import Heatmap from './components/Heatmap.js';

import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';

export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
    
    let qid=el.getAttribute("data-alt") || "2";

    let frameRequest = requestAnimationFrame(function checkInnerHTML(time) {
        ////console.log(time)
        var b=el.querySelector(".matrix");
        if(b && b.getBoundingClientRect().height) {
            b.id="matrix"+qid;
            cancelAnimationFrame(checkInnerHTML);
            dataLoaded()
            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });

    function dataLoaded() {
        //console.log(median)
        let data=[];
        results.forEach((d)=>{

            let gnm_country=median.results.find((c)=>(c.country===d.country));

            ////console.log(d.country,gnm_country)
            if(typeof gnm_country !== 'undefined') {
                d.questions.forEach((q)=>{
                    q.gnm=gnm_country.values[q.question];
                    ////console.log(d.country,q)
                    q.country=d.country;
                    q.ISO=d.ISO;
                    if(q.question !== '7b') {
                        q.diff=Math.abs(q.mean - q.actual);
                        q.gnm_diff=Math.abs(q.gnm - q.actual);
                        q.n=gnm_country.values.n;
                        data.push(q)    
                    }
                    
                })    
            }
            
        })
        //console.log(questions)
        //console.log(data)

        let data_groupby_question=d3.nest() 
                                    .key((d)=>d.question)
                                    .entries(data)

        //console.log(data_groupby_question)

        let data_groupby_country=d3.nest() 
                                    .key((d)=>d.country)
                                    .entries(data)

        //console.log(data_groupby_country)

        data_groupby_country.forEach((d)=>{
            d.gnm_diff=d3.median(d.values,(v)=>v.gnm_diff)
            d.sum_diff=d3.sum(d.values,(v)=>v.gnm_diff)
        })
        /*
        console.log(data_groupby_country.sort((a,b)=>{
            return a.gnm_diff - b.gnm_diff
        }).map((d,i)=>i+","+d.key+":"+d.gnm_diff))
        */
        //return;
        
        new Heatmap(data_groupby_question.filter((d)=>{
                return d.key===qid
            }),{
            container:"#matrix"+qid,
            questions:questions,
            question:questions.find((d)=>{
                return d.id===qid
            })
        })

    }
    
    
}
