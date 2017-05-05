import "webdriverio"
import { TestApp } from "./test-app"
import { assert } from "chai"
import { TestPage } from "./pages/test-page"
import * as mocha from 'mocha'

describe('sprotty client basic elements', () => {
    let url = '';
    let testPage: TestPage;
    let testApp: TestApp;

    before(() => {
        testApp = new TestApp();
        browser.url(url);
        testPage = new TestPage(browser);
    });

    it('page is loaded', () => {
        assert.isTrue(testPage.isLoaded());
    });

    after(() => {
        testApp.close();
    });
});