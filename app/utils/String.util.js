export class StringUtil {

    /**
     * 
     * @param {String} content 
     * @returns {Number}
     */
    static hash = (content) => {
        var hash = 0, i, chr;
        if (content.length === 0) return hash;
        for (i = 0; i < content.length; i++) {
            chr = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }

        return hash;
    }

}