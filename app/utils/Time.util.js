export class TimeUtil {

    static currentUTCTimestamp = () => {
        let d1 = new Date();
        let d2 = new Date(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds());
        return Math.floor(d2.getTime() / 1000) 
    }

}