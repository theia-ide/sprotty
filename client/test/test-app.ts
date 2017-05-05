import * as express from "express"
import * as http from "http"
export class TestApp {
    app: express.Express;
    server: http.Server;
    constructor() {
        this.app = express();
        this.app.use('/static', express.static('test/'));
        this.server = this.app.listen(4000, function () {
            console.log('Test app running on port 5000');
            
        });
    }

    public close() : void {
        this.server.close();
    }
}





