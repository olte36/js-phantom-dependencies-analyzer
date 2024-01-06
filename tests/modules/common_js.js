const module1 = require("requireModule")

function dummyFunction() {
    const module2 = require("requireModuleInsideFunction")
}

const config = {
    module3: require("requireModuleInObject")
}