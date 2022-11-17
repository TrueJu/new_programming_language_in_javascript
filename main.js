var fs = require('fs');

function lex(srcCodePATH) {
    const srcCode = fs.readFileSync(srcCodePATH, 'utf8');
    var srcLEX = [];    // Filtered source code
    var DictLEX = [];   // 'values' e.g. function names, variable names etc.
    var pLEX = [];      // Every instruction from the srcLEX
    var cpLEX = [];     // Only instruction matching the values from DictLEX

    var srcLEX = srcCode.match(/\S+|[[:blank:]]|(?:"[^"]*"|^[^"]*$)/g);

    function pushLEX(ppLEX, pcpLEX, pDictLEX) {
        pLEX.push(ppLEX);
        cpLEX.push(pcpLEX);
        DictLEX.push(pDictLEX);
    }

    for(var i=0;i<srcLEX.length;i++) {
        if(srcLEX[i][0] === '$') {
            if(srcLEX[i].includes('(') && srcLEX[i].includes(')') || srcLEX[i+1].includes('(') && srcLEX[i+1].includes(')')) {
                pushLEX('function definition', 'function', srcLEX[i].replace(/\s*\(.*?\)\s*/g, '').substr(1));
            } else {
                pushLEX('function definition', '!', '!');
            }
        } else if(srcLEX[i][0] === '{' || srcLEX[i][0] === '}') {
            srcLEX[i][0] === '{' ? pushLEX('function start', '{', '{') : pushLEX('function end', '}', '}');
        } else if(srcLEX[i].includes('print')) {
            var tmp = "";
            if(srcLEX[i].includes(')')) {
                tmp = srcLEX[i].substring(
                    srcLEX[i].lastIndexOf('(') + 1, 
                    srcLEX[i].lastIndexOf(')')
                );
            } else {
                for(var l=i;l<srcLEX.length;l++) {
                    if(srcLEX[l].includes('");')) {
                        tmp += srcLEX[l];
                        l = srcLEX.length;
                    } else {
                        tmp += srcLEX[l] + ' ';
                    }
                }
                tmp.indexOf(' ') == -1 ? tmp = tmp.replace( ' ', '' ) : tmp;
                tmp = tmp.replace('print(','');
                tmp = tmp.replace(');','');
            }
            pushLEX('print statement', 'print', tmp);
        } else if(srcLEX[i].includes("var")) {
            if(srcLEX[i+1] != '=') {
                var tmp = "";
                var counter = 0;
                for(var j=i+2;j<srcLEX.length;j++) {
                    if(srcLEX[j][0] === '"' && srcLEX[j].slice(-2)[0] === '"') {
                        tmp = srcLEX[j];
                    } else if(srcLEX[j][0] === '"' || srcLEX[j].slice(-2)[0] === '"') {
                        tmp += srcLEX[j] + ' ';
                        counter == 2 ? j = srcLEX.length+1 : counter +=1;
                    } else {
                    
                    }
                }
                tmp.indexOf(' ') == -1 ? tmp = tmp.replace( ' ', '' ) : tmp;
                pushLEX('variable declaration', 'var', srcLEX[i+1] + '=' + tmp.slice(1, -2));
            } else {
                pushLEX('variable declaration', '!', '!');
            }
        } else if(srcLEX[i][0] == '%') {
            var tmp = srcLEX[i].substring(
                srcLEX[i].lastIndexOf("%") + 1, 
                srcLEX[i].lastIndexOf("(")
            );

            pushLEX('function call', 'call', tmp);
        }
    }
    return [srcLEX, pLEX, cpLEX, DictLEX];
}
function parser(LEX_OUT) {
    var srcLEX = LEX_OUT[0];    // Filtered source code
    var DictLEX = LEX_OUT[3];   // 'values' e.g. function names, variable names etc.
    var pLEX = LEX_OUT[1];      // Every instruction from the srcLEX
    var cpLEX = LEX_OUT[2];     // Only instruction matching the values from DictLEX

    var funcDict = {};
    var funcRes = {};
    var exeStack = [];
    var storedVals = {};

    function execute(method, value) {
        switch(method) {
            case 'print':
                if(!value.includes('"')) {
                    console.log(storedVals['test']);
                } else {
                    console.log(value);
                }
                break;
            default:
                break;
        }
    }
    function exeFunc(funcStack) {
        for(var e=0;e<funcDict[funcStack].length;e++) {
            if(funcDict[funcStack][e][0] == 'var') {
                var tmp = funcDict[funcStack][e][1].indexOf('=');
                storedVals[funcDict[funcStack][e][1].slice(0, tmp)] = funcDict[funcStack][e][1].slice(tmp+1, -1);
                execute(funcDict[funcStack][e][0], funcDict[funcStack][e][1]);
            } else {
                execute(funcDict[funcStack][e][0], funcDict[funcStack][e][1]);
            }
        }
    }
    for(var i=0;i<cpLEX.length;i++) {
        switch(cpLEX[i]) {
            case 'function':
                funcDict[DictLEX[i]] = [];
                for(var j=i+2;j<cpLEX.length;j++) {
                    if(cpLEX[j] == '}') {
                        j = cpLEX.length;
                    } else {
                        funcDict[DictLEX[i]].push([cpLEX[j], DictLEX[j]]);
                        funcRes[DictLEX[j]] = 'reserved';
                    }
                }
                break;
            case 'print':
                if(funcRes[DictLEX[i]] != 'reserved') {
                    if(DictLEX[i].includes('"')) {
                        exeStack.push(['print', DictLEX[i]]);
                    } else {
                        //variable
                    }
                }
                break;
            case 'call':
                exeStack.push(['call', DictLEX[i]]);
                break;
            default:
                break;
        }
    }
    for(var s=0;s<exeStack.length;s++) {
        if(exeStack[s][0] == 'call') {
            exeFunc(exeStack[s][1]);
        } else {
            execute(exeStack[s][0], exeStack[s][1]);
        }
    }
}
function main() {
    var LEXo;
    var PARSERo;

    LEXo  = lex('text.tjx');
    PARSERo = parser(LEXo);
}
main();