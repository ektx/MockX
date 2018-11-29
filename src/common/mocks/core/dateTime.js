/*
    DEMO:
    calendar.format('YYYY-MM-DD')
    => 2017-02-01

    calendar.format('YYYY-MM-DD hh:mm:ss')
    => 2017-02-01 08:09:05

    calendar.format('YY-M-D h:m:s')
    => 17-2-1 8:9:5

    calendar.format('YYYY-MM-DD', '2017/5/3')
    => 2017-05-03

*/
    
function date(format, setTime) {
    let timeArr = format.split(/\W+/)
    let markArr = format.split(/\w+/)
    let result = []
    let time = setTime ? new Date(setTime) : new Date()
    let timeStr = ''

    let makeUp0 = function (value, time) {
        if (value.length == 2 && time < 10) {
            time = '0' + time
        }
        return time
    }

    for (let i = 0, l = timeArr.length; i < l; i++) {
        let _str = timeArr[i], tem = 0;
        switch ( _str ) {
            case 'YYYY':
            case 'YY': 
                tem = time.getFullYear()
                if (_str.length == 2) {
                    tem = tem.toString().slice(2)
                }
                break;

            case 'MM':
            case 'M':
                tem = makeUp0(_str, time.getMonth() + 1)
                break;

            case 'DD':
            case 'D':
                tem = makeUp0(_str, time.getDate())
                break;

            case 'hh':
            case 'h':
                tem = makeUp0(_str, time.getHours())
                break;

            case 'mm':
            case 'm':
                tem = makeUp0(_str, time.getUTCMinutes())
                break;

            case 'ss':
            case 's':
                tem = makeUp0(_str, time.getSeconds())
                break;
        }

        result.push( tem )
    }

    for (let x = 1, y = markArr.length; x < y; x++) {
        timeStr += result[x - 1] + markArr[x]
    }

    return timeStr
}

export default date