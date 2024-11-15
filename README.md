Here’s the revised version with the tech stack integrated into a paragraph:

---

# LingoLoop

LingoLoop is a unique, crowdsourced platform that captures and analyzes generational language trends through slang, utilizing both data collection and gamified engagement. This project aims to provide a comprehensive view of how language evolves across different age groups by collecting, moderating, and visualizing slang terms, their definitions, and contextual usage.

## Data

We begin by describing the format of our data. All sample inputs/outputs can be viewed in the files of the `data/` directory

The data collected from our workers is the input to the QC module. Examples are shown in `qc_input.json`. We are essentially collecting slang terms, their definitions, and example sentences from our workers. In addition, for every term collected, we track the worker's generation so we can later derive insights about the use of slang terms over time. Once the QC is performed, we have an output that includes all the information collected from the workers along with metrics that describe the reliability of the information. If the collected terms have quality metrics below standards we have set, we will discard them.

The goal of aggregation is to create multiple-choice quiz questions for a slang definition challenge as well as collect statistics on which generations use a term most commonly. As such, we take in slang definitions as inputs in `aggregation_input.json` and produce multiple choice responses plus generation usage totals in `aggregation_output.json`. Finally, we have a `raw_slang_terms.json` which tracks which words have been submitted to our system by workers.

## Project Components and Milestones

### Data Collection System

The heart of LingoLoop’s data gathering lies in a custom-built MTurk interface designed to collect slang terms along with demographic data about each contributor. Workers submit slang terms, provide example sentences, and offer definitions. Each component is designed to capture a rich, generationally segmented dataset on evolving language.

Milestones here include creating MTurk HIT templates, implementing user-friendly data collection forms, and setting up demographic-based qualifications for participants before deploying initial tasks.

### Quality Control Module

Ensuring data integrity is crucial for meaningful analysis, so this module filters responses with a range of validation methods. From implementing attention checks and spotting duplicate entries to applying content moderation, this system helps maintain high-quality submissions. A duplicate detection algorithm and response validation pipeline add an additional layer of accuracy.

Key milestones involve setting up attention checks, creating filtering rules, and building the validation pipeline.

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
