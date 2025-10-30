function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Filter to just the written tweets (original behavior)
	tweet_array = runkeeper_tweets
		.map(t => new Tweet(t.text, t.created_at))
		.filter(t => t.written);
}

function addEventHandlerForSearch() {
	// Search the written tweets as text is entered into the search box, and add them to the table
	const input = document.getElementById('textFilter');
	const tableBody = document.getElementById('tweetTable');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');

	function renderRows(rows) {
		tableBody.innerHTML = rows.map((t, idx) => t.getHTMLTableRow(idx + 1)).join('');
	}

	function onSearch() {
		const query = input.value || '';
		searchText.textContent = query;
		if (!query) {
			searchCount.textContent = '0';
			tableBody.innerHTML = '';
			return;
		}
		const lower = query.toLowerCase();
		const matches = tweet_array.filter(t => t.writtenText.toLowerCase().includes(lower));
		searchCount.textContent = String(matches.length);
		renderRows(matches);
	}

	input.addEventListener('input', onSearch);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});