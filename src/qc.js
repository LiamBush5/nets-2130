// Quality Control module for validating language learning submissions
import { readFileSync, writeFileSync } from 'fs';

class QualityControl {
    constructor() {
        // Minimum character lengths for valid submissions
        this.minDefinitionLength = 5;
        this.minExampleLength = 10;
    }

    /**
     * Validates a single submission and returns it with quality metrics
     * @param {Object} submission - The submission object containing definition and example
     * @returns {Object} Enhanced submission with status, quality score, and flags
     */
    validateSubmission(submission) {
        const flags = [];  // Array to collect any quality issues
        let qualityScore = 1.0;  // Perfect score to start, reduced for each issue

        // Check if definition exists and meets minimum length
        if (!submission.definition) {
            flags.push('missing_definition');
            qualityScore *= 0.5;  // Significant penalty for missing definition
        } else if (submission.definition.length < this.minDefinitionLength) {
            flags.push('short_definition');
            qualityScore *= 0.7;  // Moderate penalty for short definition
        }

        // Check if example exists and meets minimum length
        if (!submission.example) {
            flags.push('missing_example');
            qualityScore *= 0.8;  // Penalty for missing example
        } else if (submission.example.length < this.minExampleLength) {
            flags.push('short_example');
            qualityScore *= 0.9;  // Minor penalty for short example
        }

        // Determine submission status based on flags
        let status = 'approved';  // Default status
        if (flags.includes('missing_definition')) {
            status = 'rejected';  // Auto-reject if definition is missing
        } else if (flags.length > 0) {
            status = 'pending';   // Set to pending if there are any other issues
        }

        // Return enhanced submission with quality metrics
        return {
            ...submission,
            status,
            quality_score: Number(qualityScore.toFixed(2)),  // Round to 2 decimal places
            flags
        };
    }

    /**
     * Process multiple submissions from a file and save results
     * @param {string} inputFile - Path to JSON file containing submissions
     * @param {string} outputFile - Path where processed results will be saved
     * @returns {Array} Array of processed submissions
     */
    processSubmissions(inputFile, outputFile) {
        // Read and parse input file
        const data = JSON.parse(readFileSync(inputFile, 'utf8'));
        // Process each submission through validation
        const reviewedSubmissions = data.submissions.map(sub => this.validateSubmission(sub));

        // Save results to output file with pretty formatting (2 space indent)
        writeFileSync(outputFile, JSON.stringify({
            reviewed_submissions: reviewedSubmissions
        }, null, 2));

        return reviewedSubmissions;
    }
}

// Export the QualityControl class for use in other modules
export default QualityControl;