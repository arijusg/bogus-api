export class PROCES {
    public readonly STATUST: string;
    public readonly VOLGNUM: string;
    public readonly STATUS: string;
    constructor(obj: PROCES) {
        this.STATUST = obj.STATUST;
        this.VOLGNUM = obj.VOLGNUM;
        this.STATUS = obj.STATUS;
    }
}

export class AILHEADER {
    public readonly CLIENTID: string;
    public readonly CORRELATIONID: string;
    constructor(obj: AILHEADER) {
        this.CLIENTID = obj.CLIENTID;
        this.CORRELATIONID = obj.CORRELATIONID;
    }
}

export class SubmitResponse {
    public readonly PROCES: PROCES;
    public readonly AILHEADER: AILHEADER;
    constructor(obj: SubmitResponse) {
        this.PROCES = new PROCES(obj.PROCES);
        this.AILHEADER = new AILHEADER(obj.AILHEADER);
    }
}

export class AilResponse {
    public readonly submitResponse: SubmitResponse;
    constructor(obj: AilResponse) {
        this.submitResponse = new SubmitResponse(obj.submitResponse);
    }
}