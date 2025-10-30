function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Build dataset for activity counts (completed events only, with known activity types)
	const completed = tweet_array.filter(t => t.source === 'completed_event');
	const activities = completed.map(t => ({ activityType: t.activityType })).filter(d => d.activityType !== 'unknown');

	// Distinct activity types count and top 3
	const freq = {};
	for (const a of activities) { freq[a.activityType] = (freq[a.activityType] || 0) + 1; }
	const distinctTypes = Object.keys(freq);
	document.getElementById('numberActivities').innerText = String(distinctTypes.length);
	const top3 = distinctTypes.sort((a,b) => freq[b]-freq[a]).slice(0,3);
	document.getElementById('firstMost').innerText = top3[0] || 'unknown';
	document.getElementById('secondMost').innerText = top3[1] || 'unknown';
	document.getElementById('thirdMost').innerText = top3[2] || 'unknown';

	// Graph: number of Tweets per activity type
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activities
	  },
	  "width": 500,
	  "height": 350,
	  "mark": {"type": "bar"},
	  "encoding": {
	    "x": {"field": "activityType", "type": "nominal", "title": "Activity type", "sort": "-y"},
	    "y": {"aggregate": "count", "type": "quantitative", "title": "Number of tweets"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	// Create distance vs day datasets for top 3 activities
	function dayLabel(d) {
		const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
		return days[d];
	}
	const distanceData = completed
		.filter(t => t.distance > 0 && top3.includes(t.activityType))
		.map(t => ({
			activityType: t.activityType,
			distance: t.distance,
			day: dayLabel(t.time.getDay())
		}));

	const baseDistanceSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"data": { "values": distanceData },
		"width": 400,
		"height": 300,
		"encoding": {
			"x": {"field": "day", "type": "ordinal", "title": "Day of week", "sort": ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},
			"color": {"field": "activityType", "type": "nominal", "title": "Activity"}
		}
	};

	const scatterSpec = Object.assign({}, baseDistanceSpec, {
		mark: { type: 'point', opacity: 0.5 },
		encoding: Object.assign({}, baseDistanceSpec.encoding, {
			y: {"field": "distance", "type": "quantitative", "title": "Distance (mi)"}
		})
	});
	vegaEmbed('#distanceVis', scatterSpec, {actions:false});

	const meanSpec = Object.assign({}, baseDistanceSpec, {
		mark: { type: 'line', point: true },
		encoding: Object.assign({}, baseDistanceSpec.encoding, {
			y: {"aggregate": "mean", "field": "distance", "type": "quantitative", "title": "Mean distance (mi)"}
		})
	});
	vegaEmbed('#distanceVisAggregated', meanSpec, {actions:false});

	// Toggle between scatter and mean plots
	const aggBtn = document.getElementById('aggregate');
	const scatterDiv = document.getElementById('distanceVis');
	const meanDiv = document.getElementById('distanceVisAggregated');
	meanDiv.style.display = 'none';
	aggBtn.addEventListener('click', function(){
		if (meanDiv.style.display === 'none') {
			meanDiv.style.display = '';
			scatterDiv.style.display = 'none';
			aggBtn.textContent = 'Show all points';
		} else {
			meanDiv.style.display = 'none';
			scatterDiv.style.display = '';
			aggBtn.textContent = 'Show means';
		}
	});

	// Fill in hard-coded answers based on graphs (allowed by spec)
	document.getElementById('longestActivityType').innerText = 'running';
	document.getElementById('shortestActivityType').innerText = 'walking';
	document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});