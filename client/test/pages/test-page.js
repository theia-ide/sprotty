"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestPage = (function () {
    function TestPage(driver) {
        this.driver = driver;
    }
    // public selectNode("")
    TestPage.prototype.isLoaded = function () {
        if (this.driver.element('h1').state === 'success') {
            return true;
        }
        else {
            return false;
        }
        // if(this.driver.element('#theia-main-content-panel').state === 'success') {
        //     return true;
        // } else {
        //     return false;
        // }
    };
    TestPage.prototype.clickRandomNode = function (tabNumber) {
        this.driver.click('svg#graph > g.node:nth-child(1)');
        // this.driver.click(`ul.p-MenuBar-content > .p-MenuBar-item:nth-child(${tabNumber})`);
    };
    return TestPage;
}());
exports.TestPage = TestPage;
//# sourceMappingURL=test-page.js.map