# LingoLoop

LingoLoop is a unique, crowdsourced platform that captures and analyzes generational language trends through slang, utilizing both data collection and gamified engagement. This project aims to provide a comprehensive view of how language evolves across different age groups by collecting, moderating, and visualizing slang terms, their definitions, and contextual usage. See the following section for instructions on how to contribute!

## Running The Application: How to Contribute

1. Clone the repository. Ensure you have the project files in a directory called nets2130.
2. Install dependencies. Run the following command in the project root: yarn install (You may need to delete `package-lock.json` to prevent errors on this step)
3. Add the Supabase library. Install the required Supabase package by running: yarn add @supabase/supabase-js  
4. In the project root, create a .env file and add the following environment variables:

NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>  

NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key> 

Note: Contact Liam for the correct credentials to use for these values.

5. Start the application. Run the development server using: yarn dev
   
6. Access the app. Open your browser and navigate to http://localhost:3000 to interact with the application.
## Data

We begin by describing the format of our data. All sample inputs/outputs can be viewed in the files of the `data/` directory

The data collected from our workers is the input to the QC module. Examples are shown in `qc_input.json`. We are essentially collecting slang terms, their definitions, and example sentences from our workers. In addition, for every term collected, we track the worker's generation so we can later derive insights about the use of slang terms over time. Once the QC is performed, we have an output that includes all the information collected from the workers along with metrics that describe the reliability of the information. If the collected terms have quality metrics below standards we have set, we will discard them.

The goal of aggregation is to create multiple-choice quiz questions for a slang definition challenge as well as collect statistics on which generations use a term most commonly. As such, we take in slang definitions as inputs in `aggregation_input.json` and produce multiple choice responses plus generation usage totals in `aggregation_output.json`. Finally, we have a `raw_slang_terms.json` which tracks which words have been submitted to our system by workers.

## Project Components and Milestones

### Data Collection System

The heart of LingoLoop’s data gathering lies in a custom-built MTurk interface designed to collect slang terms along with demographic data about each contributor. Workers submit slang terms, provide example sentences, and offer definitions. Each component is designed to capture a rich, generationally segmented dataset on evolving language.

Milestones here include creating MTurk HIT templates, implementing user-friendly data collection forms, and setting up demographic-based qualifications for participants before deploying initial tasks.

### Quality Control Module

Ensuring data integrity is crucial for meaningful analysis, so this module filters responses with simple validation methods. We ensure that users make submissions that include definitions and examples alongside the original slang term. If definitions or provided examples do not meet minimum length requirements, the responses are flagged and potentially rejected. In addition, duplicate submissions are automatically rejected.

Key milestones include creating filtering rules and setting up filtering functionality.

See `src/qc.js` for relevant code.

### Aggregation Module

The Aggregation Module compiles and organizes the collected data. Statistical analysis functions are created to evaluate trends, with clustering by generation and popularity tracking tools to visualize how terms evolve. This component not only organizes but also synthesizes insights from the data.

Progress here is tracked through creating analysis functions, building clustering capabilities, and setting up tools to monitor term popularity.

See `src/aggregation.js` for relevant code.

### Game Interface

To make exploring language trends interactive and engaging, LingoLoop introduces a gamified experience. This interface generates challenges based on slang familiarity, allows users to test their knowledge, and keeps track of their progress. The game is designed to be a fun way for users to engage with and learn about generational slang trends.

Milestones involve designing game mechanics, implementing a scoring system, creating a challenge generator, and establishing progress tracking.

### Visualization System

LingoLoop includes an interactive visualization system to represent trends dynamically. Users can view generational comparisons, see graphs of slang popularity, and explore their own performance data. Interactive graphs and comparison tools make the data accessible and engaging.

Milestones here include designing trend visualization components, implementing interactive graphs, and building tools for generation-based comparisons.

### Web Application

The web application serves as the platform's front-facing component, where users interact with LingoLoop’s features. It includes a user-friendly interface, API endpoints, integrated database functionality, and a comprehensive search system. This component ensures seamless access and interaction with the collected data.

Milestones include user interface design, API development, database setup, and building a functional search system.

## Technical Stack

LingoLoop is built with a React frontend, utilizing JavaScript for the backend, and a SupaBase database to manage and store data. Together, these tools provide the necessary infrastructure to handle data collection, analysis, and user engagement seamlessly.

## Technical Documentation

This section contains a brief documentation for code relevant to QC, aggregation, and all supporting code.

QC logic for assessing response quality can be found in `src/qc.js`. Additional QC logic that prevents duplicate repsonses–i.e. submitted responses whose term and generation of user match an existing response in our database–can be found in the `handleContributeSubmit()` function in `src/components/contribute.tsx`. Aggregation logic is found under `src/aggregation.js`. The rest of the core supporting code can be found in `src/components`. `src/components/contribute.tsx` implements the slang input page, `src/components/play.tsx` implements the slang quiz game, `src/components/search.tsx` implements the slang search page, and `src/components/stats.tsx` handles the aggregation results.

Our project aims to assess the usage rates of slang terms over time as well as the familiarity of respondents of different generations with various slang. Slang term usage for a particular generation is measured by counting the number of times a user of that generation submits a response for the specific term. We can then use this data to compare usage totals across generations, which provides a sense of which generation finds a slang term most popular. Meanwhile, a generation's familiarity with a slang term is measured by the accuracy of that generation's respondents on the multiple-choice quiz question which asks for the term's definition.

