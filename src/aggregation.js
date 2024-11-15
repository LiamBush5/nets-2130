class AggregationModule {
    constructor() {
        this.requiredGenerations = ['Gen Z', 'Millennial', 'Gen X', 'Baby Boomer'];
    }

    createQuizQuestion(termData) {
        // Check if we have all required generations
        const hasAllGenerations = this.requiredGenerations.every(gen =>
            termData.approved_definitions.some(def => def.generation === gen)
        );

        if (!hasAllGenerations) {
            return null;
        }

        // Sort definitions by quality score within each generation
        const bestDefinitions = this.requiredGenerations.map(gen => {
            const genDefs = termData.approved_definitions.filter(def => def.generation === gen);
            return genDefs.sort((a, b) => b.quality_score - a.quality_score)[0];
        });

        // Create generation mapping and options array
        const generationMapping = {};
        const options = bestDefinitions.map((def, index) => {
            generationMapping[def.generation] = index;
            return def.definition;
        });

        // Add "I don't know" option
        options.push("I don't know");

        return {
            question_id: `q${termData.term_id}`,
            term: termData.term,
            correct_definition: bestDefinitions[0].definition, // Using Gen Z as "correct" for demo
            options,
            generation_mapping: generationMapping
        };
    }

    async aggregate(inputFile, outputFile) {
        const data = await import(inputFile);
        const quizQuestion = this.createQuizQuestion(data);

        const output = {
            quiz_questions: quizQuestion ? [quizQuestion] : []
        };

        const fs = await import('fs');
        await fs.promises.writeFile(outputFile, JSON.stringify(output, null, 2));
        return output;
    }
}

export default AggregationModule;