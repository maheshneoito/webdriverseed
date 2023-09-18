'use strict';
 
import yargs from 'yargs/yargs';
const argv = yargs(process.argv.slice(2)).parseSync();
import Jimp from 'jimp';
const { generate } = require('multiple-cucumber-html-reporter');
import * as commonHelper from '../../support/commonHelpers'
const featureSet = require('../data/featureSet').data;

import fs from 'fs';
import { string } from 'yargs';


/**
 * Get the featurefiles that need to be run based on an command line flag that is passed, if nothing is passed all the
 * featurefiles will run.
 *
 * @example:
 *
 *     // For 1 feature
 *     npm run web-e2e -- --feature=home
 *
 *     // For multiple features
 *     npm run web-e2e -- --feature=home,login,...
 *
 */
export const getFeatureFiles = (): any => {
    const directoryPath = `${process.cwd()}/e2e-tests/features/`;
    const fileNames = fs.readdirSync(directoryPath);
    /**
     * removes the extention from the file name
    */
    const fileList = fileNames.map(file => file.split('.').slice(0, -1).join('.'));
    //get domain and env, then get the skip feature list of that domain then remove the features from the feature list passed to the spec.
    // console.log({skipDom});
    
    const featureName: any = argv.feature;
    if (argv.feature) {
        let fSet = featureName.split(',')
            .map((feature: any) => `${process.cwd()}/e2e-tests/**/${feature}.feature`);
        return fSet;
    }
    const allFeatures = fileList.map(feature => `${process.cwd()}/e2e-tests/**/${feature}.feature`);
    return allFeatures;
}

/**
 * Get list of tags that need to be run based on an command line flag that is passed, if nothing is passed all the
 * featurefiles(e2e) will run.
 * 
 *
 * @example:
 * 
 *     // For 1 smoke tag
 *     npm run android.app -- --tags=@home
 *
 *     // For multiple smoke tags
 *     npm run android.app -- --tags=@home,@login,...
 */
export const getTags = (): string => {
    const tags: any = argv.tags;
    if (argv.tags) {
        return tags.replace(/(^,)|(,$)/g, "").split(',').join(' or ');
    }
    return '';
}


/**
 * Resize + optimize images.
 *
 * @param Array images An array of images paths.
 * @param Number width A number value of width e.g. 1920.
 * @param Number height Optional number value of height e.g. 1080.
 * @param Number quality Optional number value of quality of the image e.g. 90.
 */
export const optimizeImage = async (imgPath: string, width = Jimp.AUTO, height: number = 768, quality: number = 90): Promise<void> => {
    const image = await Jimp.read(imgPath);
    await image.resize(width, height);
    await image.quality(quality);
    await image.writeAsync(imgPath);
};

/**
 * Function to generate cucumber HTML report.
 */
export const generateReport = async (): Promise<void> => {
    if (fs.existsSync('./reports')) {
        if (fs.existsSync('./reports/report')) {
            fs.rmdirSync('./reports/report', { recursive: true });
        }
        await generate({
            jsonDir: './reports/json/',
            reportPath: './reports/report/',
            pageTitle: 'Credzy HTML Report',
            reportName:'Credzy Web E2E Report ',
            displayDuration: true,
            // displayReportTime:true,
        });
    }
}

export const getBrowserName = () => {
    let browser = 'chrome';
    if (argv.browserName) {
        if (argv.browserName === 'firefox') {
            browser = 'firefox'
        }
        else if (argv.browserName === 'edge') {
            browser = 'edge';
        }
        else if (argv.browserName === 'safari') {
            browser = 'safari';
        }
        else if (argv.browserName === 'ie') {
            browser = 'ie';
        }
    }
    return browser;
}
