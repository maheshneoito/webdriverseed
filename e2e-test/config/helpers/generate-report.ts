import { generateReport } from './functions';

/**
 * Function to generate cucumber HTML report.
 * 
 * To execute this function, run command
 * 
 * npm run generateReport
 */
(async () => {
    await generateReport();
})();