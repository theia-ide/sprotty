import { Client } from "webdriverio"

export class TestPage {

    private driver: Client<any>;
    public constructor(driver: Client<any>) {
        this.driver = driver;
    }
    public isLoaded(): Boolean {
        if (this.driver.element('h1').state === 'success') {
            return true;
        } else {
            return false;
        }
    }

    public clickRandomNode(tabNumber: Number): void {
        this.driver.click('svg#graph > g.node:nth-child(1)');
    }
}