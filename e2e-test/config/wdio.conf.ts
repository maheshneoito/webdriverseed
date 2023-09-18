const cucumberJson = require('wdio-cucumberjs-json-reporter').default;
import { getFeatureFiles, getTags, optimizeImage, generateReport, getBrowserName } from './helpers/functions';
import { getCapabilities } from './data/capabilities';
import fs from 'fs';
import os from 'os';
import { resolve } from 'path';
import { ensureDirSync } from 'fs-extra';
import * as commonHelpers from '../support/commonHelpers';
import yargs from 'yargs/yargs';
const argv = yargs(process.argv.slice(2)).parseSync();

let e2eDeviceType = "web";
let e2eDomainName = "com";
let e2eBrowserName;
global.__vars = [];

export const config: WebdriverIO.Config = {
    // runner: "local",
    port: 4444,
    path: "/wd/hub/",
    specs: getFeatureFiles(),
    autoCompileOpts: {
        autoCompile: true,
        // see https://github.com/TypeStrong/ts-node#cli-and-programmatic-options
        // for all available options
        tsNodeOpts: {
            transpileOnly: true,
            project: 'test/tsconfig.json'
        }
        // tsconfig-paths is only used if "tsConfigPathsOpts" are provided, if you
        // do please make sure "tsconfig-paths" is installed as dependency
        // tsConfigPathsOpts: {
        //     baseUrl: './'
        // }
    },
    exclude: [
        // 'path/to/excluded/files'
    ],
    capabilities: getCapabilities(),
    logLevel: 'warn',
    baseUrl:'www.google.com',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 1,
    services: [],
    framework: 'cucumber',
    reporters: ['spec', 
    // ['cucumberjs-json', {
    //     jsonFolder: './reports/json/',
    //     language: 'en',
    // }],
    ['junit', {
        outputDir: './',
        suiteNameFormat: /[^a-zA-Z0-9@]+/,
        outputFileFormat: function(options: { cid: any; capabilities: any; }) { // optional
            return `results-${options.cid}.${options.capabilities}.xml`
        }
    }]
    ],
    cucumberOpts: {
        // <string[]> (file/dir) require files before executing features
        require: ['./.jsrc/e2e-tests/stepDefinition/**/*.steps.js'],
        // <boolean> show full backtrace for errors
        backtrace: false,
        // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
        requireModule: [],
        // <boolean> invoke formatters without executing steps
        dryRun: false,
        // <boolean> abort the run on first failure
        failFast: false,
        // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
        format: ['pretty'],
        // <boolean> hide step definition snippets for pending steps
        snippets: true,
        // <boolean> hide source uris
        source: true,
        // <string[]> (name) specify the profile to use
        profile: [],
        // <boolean> fail if there are any undefined or pending steps
        strict: false,
        // <string> (expression) only execute the features or scenarios with tags matching the expression
        tagExpression: getTags(),
        // <number> timeout for step definitions
        timeout: 240000,
        // <boolean> Enable this config to treat undefined definitions as warnings.
        ignoreUndefinedDefinitions: false
    },

    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    // onPrepare: function (config, capabilities) {
    // },
    /**
     * Gets executed before a worker process is spawned and can be used to initialise specific service
     * for that worker as well as modify runtime environments in an async fashion.
     * @param  {String} cid      capability id (e.g 0-0)
     * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
     * @param  {[type]} specs    specs to be run in the worker process
     * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
     * @param  {[type]} execArgv list of string arguments passed to the worker process
     */
    // onWorkerStart: function (cid, caps, specs, args, execArgv) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     */
    // beforeSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs        List of spec file paths that are to be run
     * @param {Object}         browser      instance of created browser/device session
     */
    before: async function (capabilities, specs) {
        const sessionId = browser.sessionId;
        const browserName = getBrowserName().trim();
        __vars[sessionId + ".browserName"] = browserName;
        if (browserName !== "") {
            e2eBrowserName = browserName;
        }
        if (argv.mobile) {
            console.log("Mobile web testing!");
            const width = 375;
            const height = 667;
            browser.setWindowSize(width, height);
            __vars[sessionId + ".mobileWeb"] = true;
            e2eDeviceType = "mobileWeb";
        }
        else {
            const width = 1366;
            const height = 768;
            browser.setWindowSize(width, height);
            __vars[sessionId + ".mobileWeb"] = false;
        }

        if (argv.domain) {
            const getUrl = domainList.filter(dm => dm.domain === argv.domain);
            if (`${argv.domain}`.length > 0 && getUrl.length > 0) {
                __vars[sessionId + ".domainName"] = getUrl[0].domain;
                e2eDomainName = getUrl[0].domain;
            }
        }

        if (os.platform() == "darwin") {
            __vars[sessionId + ".osx"] = true;
        }
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Runs before a Cucumber feature
     */
    // beforeFeature: function (uri, feature) {
    // },
    /**
     * Runs before a Cucumber scenario
     */
    beforeScenario: async function (world) {
        await commonHelpers.deleteAllBrowserData();
        const sessionId = browser.sessionId;
        const scenarioTagArray = world.pickle.tags;
        const scenarioTag = scenarioTagArray.map((tags: any) => tags.name);
        const skipStep: boolean = await commonHelpers.skipStep(scenarioTag);
        if (skipStep) {
            __vars[sessionId + ".skipStep"] = true;
        }
        if (scenarioTag.includes("@bulk-order")) {
            __vars[sessionId + ".bulkOrder"] = true;
        }
    },
    /**
     * Runs before a Cucumber step
     */
    // beforeStep: function (step, context) {
    // },
    /**
     * Runs after a Cucumber step
     */
    afterStep: async function (step, scenario, result) {
        if (result.error) {
            let featureName: string = (scenario.uri || 'scenario').match(/([^\/]+)(?=\.\w+$)/)![0]
                .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s/g, '-')
                .toLowerCase().substr(0, 100);
            const fileName = `${Date.now()}.${featureName}.png`;
            const screenshotPath = resolve(process.cwd(), 'reports/screenshots');
            const filepath = resolve(screenshotPath, fileName);
            // Create directory if not available in the given path.
            ensureDirSync(screenshotPath);
            await browser.saveScreenshot(filepath);
            // await optimizeImage(filepath);
            const fileData = fs.readFileSync(filepath, { encoding: 'base64' });
            // Attach screenshot to the failed step.
            await cucumberJson.attach(fileData, 'image/png');
        }
    },
    /**
     * Hook that gets executed _after_ a hook within the suite ends (e.g. runs after calling
     * afterEach in Mocha)
     * stepData and world are Cucumber framework specific
     */
    // afterHook: function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
    // },
    /**
     * Runs after a Cucumber scenario
     */
    afterScenario: async function (world) {
        const sessionId = browser.sessionId;
        // await browser.reset();
        if (__vars[sessionId + ".skipStep"]) {
            delete __vars[sessionId + ".skipStep"];
        }
        if (__vars[sessionId + ".FOH_loggedin"]) {
            delete __vars[sessionId + ".FOH_loggedin"];
        }
        if (__vars[sessionId + ".ignoreRFC"]) {
            delete __vars[sessionId + ".ignoreRFC"];
        }
        if (__vars[sessionId + ".partsList"]) {
            delete __vars[sessionId + ".partsList"];
        }
        if (__vars[sessionId + ".bulkOrder"]) {
            delete __vars[sessionId + ".bulkOrder"];
        }
        await commonHelpers.deleteAllBrowserData();
    },
    /**
     * Runs after a Cucumber feature
     */
    // afterFeature: function (uri, feature) {
    // },

    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: async function () {
        await generateReport();
        console.log(`\n==========================================================================`);
        console.log(`Save the report from './reports' into './.previous-****', which is used to preserve the previous test reports / screenshots.`);
        console.log(`==========================================================================\n`);
        const env = 'QA';
        const browsername = (argv.browserName) ? argv.browserName : 'chrome'
        const device = argv.mobile ? 'mobile' : 'desktop';
        const domain = argv.domain ? argv.domain : 'com';
        const name = env + "-" + domain + "-"+ device + "-" + browsername;
        if (fs.existsSync('./reports')) {
            const fileDir = "./.previous-".concat(`${Date.now()}`,name);
            fs.renameSync('./reports', fileDir);
        }
    }
    /**
    * Gets executed when a refresh happens.
    * @param {String} oldSessionId session ID of the old session
    * @param {String} newSessionId session ID of the new session
    */
    //onReload: function(oldSessionId, newSessionId) {
    //}
}