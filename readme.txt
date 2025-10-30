--Readme document for Scarlett Zhu, jiawz32@uci.edu--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

10/10 (implemented all required parts)
- 3/3 Summarizing tweets
- 4/4 Identifying the most popular activities
- 3/3 Adding a text search interface

2. How long, in hours, did it take you to complete this assignment?

~11 hours total (TypeScript parsing, DOM updates, charts, search)

3. What online resources did you consult when completing this assignment? (list sites like StackOverflow or specific URLs for tutorials; describe queries to Generative AI or use of AI-based code completion)

- Vega-Lite docs (`https://vega.github.io/vega-lite/`)
- MDN (String methods, Date, RegExp, `toLocaleDateString`)
- math.js docs for formatting (`https://mathjs.org/docs/reference/functions/format.html`)

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

None.

5. Is there anything special we need to know in order to run your code?

A bonus feature has been added: basic sentiment mining on user-written text and display in the search table.
I extended the Tweet class to compute a simple sentiment from writtenText using small positive/negative word lists and expose sentimentScore and sentimentLabel.
I updated getHTMLTableRow to append a Bootstrap badge indicating sentiment (positive/neutral/negative) next to the tweet content.
You should now see a colored badge next to each tweet in the descriptions page table indicating its sentiment.
Green badge: positive
Gray badge: neutral
Red badge: negative