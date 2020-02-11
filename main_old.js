var fs = require('fs');

function lex(srcCodePATH) {
    const maxFunctionNameLenght = 100;
    const maxStringLength = 100;
    const syntax = [['var','='],['$', '(', ')', '{', '}', '%'],[';']];
    const srcCode = fs.readFileSync(srcCodePATH, 'utf8');
    var lastFunction;
    var srcLEX = [];
    var srcLEXDictionary = {};

    for(var i=0;i<srcCode.length;i++) {
        if(srcCode[i] == syntax[1][3]) {
            for(var j=i;j>i-maxFunctionNameLenght;j--) {
                var fNameEnd;
                if(srcCode[j] == syntax[1][0]) {
                    srcLEX.push("fstart:" + srcCode.substring(j+1, fNameEnd));
                    lastFunction = srcCode.substring(j+1, fNameEnd);
                    j = i-maxFunctionNameLenght+1;
                } else if(srcCode[j] == syntax[1][1]) {
                    fNameEnd = j;
                }
            }
        } else if(srcCode[i] == syntax[1][4]) {
            srcLEX.push("fEnd:" + lastFunction);
        } else if(srcCode[i] == ':') {
            var dataType = "";
            for(var j=i;j>i-5;j--) {
                if(srcCode[j] != ' ' && j != i){
                    dataType = srcCode[j] + dataType;
                }
            }
            if(dataType == syntax[0][0]) {
                var varName = "";
                var varValue = "";
                var valueStart = 0;
                for(var j=i;j>i-1;j++) {
                    if(srcCode[j] == syntax[0][1]) {
                        valueStart = j;
                        j = i-2;
                    } else if(j != i && srcCode[j] != ' ') {
                        varName = varName + srcCode[j];
                    }
                }
                for(var j=valueStart+1;j>i-1;j++) {
                    if(srcCode[j] == syntax[2][0]) {
                        j = i-2;
                    } else if(srcCode[j] == '"'){
                        for(var k=j+1;k<j+maxStringLength;k++) {
                            if(srcCode[k] == '"') {
                                k = j + maxStringLength;
                                j = i-2;
                            } else {
                                varValue = varValue + srcCode[k];
                            }
                        }
                    }
                }
                srcLEX.push(dataType + ':' + varName + '=' + varValue);
                srcLEXDictionary[varName] = varValue;
            }
        } else if(srcCode[i] == syntax[1][5]) {
            var functionType = "";
            for(var j=i;j<i+6;j++) {
                if(srcCode[i] != ' ') {
                    functionType += srcCode[j];
                } else {
                    console.log("Syntax error - Error calling function");
                }
            }
            if(functionType.split(syntax[1][5])[1] == "print") {
                var dataTypeName = "";
                for(var j=i+6;j<maxFunctionNameLenght;j++) {
                    if(srcCode[j] == syntax[2][0]) {
                        j = maxFunctionNameLenght;
                    } else if(srcCode[j] != syntax[1][1] && srcCode[j] != syntax[1][2]) {
                        dataTypeName +=  srcCode[j];
                    }
                }
                //console.log(srcLEXDictionary[dataTypeName]);
            }
        }
    }
    console.log(srcLEX);
    console.log(srcLEXDictionary);
}
function main() {
    lex('text.tjx');

}
main();