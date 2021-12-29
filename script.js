const input_counter = document.querySelector(".container_form_input-count");
const input_fieldset = document.querySelector(".container_form_fieldset");
const generate_button = document.querySelector(".container_form_button");
const chart_name = document.querySelector(".container_chart_title");
let count_value = parseInt(input_counter.value)

const generateInputs = (newv,container) =>{
    let diff = parseInt(newv) - count_value;
    if (diff >= 1){
        let fragment = document.createDocumentFragment();
        for (let i = 0;i < diff; i++){
            let div = document.createElement("DIV");
            div.classList.add("fieldset_input");
            div.innerHTML = `<input type="text" name="data" placeholder="Type dataname" class="dataname_input">
                            <input type="number" name="value" placeholder="Type value" step="0.005" min="0" max="1000000" class="value_input">
                            <input type="color" name="color" class="color_input">`;
            fragment.appendChild(div);
        }
        container.appendChild(fragment);
    } else {
        for (let i = 0;i < Math.abs(diff); i++){
            container.removeChild(container.lastElementChild);
        }
    }
    count_value = newv;
}
const validateInputs = (inputs,validation) => {
    return new Promise((resolve,reject)=>{
        //Initialize a variable that counts number of valid inputs to compare with the array length and determinate if all inputs
        //are valid or not
        let valid_inputs = 0;
        for (let input of inputs){
            if (!validation.test(input.value)){
                input.classList.add("input_error");
            }
            else{
                if(input.classList.contains("input_error")) input.classList.remove("input_error");
                valid_inputs++;
            }
        }
        (valid_inputs === inputs.length) ? resolve("Data submitted succesfull") : reject("Type a valid value");;
    })
}
const validateValueRange = (inputs,min,max) => {
    return new Promise((resolve,reject)=>{
        let count = 0
        for (let input of inputs){
                if (input.value.length >= min && input.value.length <= max){
                    if(input.classList.contains("input_error")) input.classList.remove("input_error");
                    count++;
                } else {
                    input.classList.add("input_error");
                }
            }
        (count === inputs.length) ? resolve("OK") : reject(`Value must have between ${min} and ${max} characters`);
    })
}
const validateNumberValues = (inputs,min,max) => {
    return new Promise((resolve,reject)=>{
        let valid_inputs = 0;
        for (let input of inputs){
            let value = parseFloat(input.value);
            if (value >= min && value <= max && typeof value === "number"){
                if(input.classList.contains("input_error")) input.classList.remove("input_error");
                valid_inputs++;
            }
            else{
                input.classList.add("input_error");
            }
        }
        (valid_inputs === inputs.length) ? resolve("ok") : reject(`Value out of range, use values between ${min} and ${max}`);
    })
}
const getHighestValue = (inputs) => {
    let number_array = [];
    inputs.forEach(input => number_array.push(parseFloat(input.value)));
    number_array.sort((a,b) => a - b);
    return number_array[inputs.length - 1];
}
const displayDataname = (inputs,colors) => {
    let fragment = document.createDocumentFragment();
    for (let i = 0;i < inputs.length;i++){
        const span = document.createElement("SPAN");
        span.classList.add("value_info");
        span.style.setProperty("--bulletcolor",colors[i].value);
        span.textContent = inputs[i].value;
        fragment.appendChild(span);
    }
    const chart_info = document.querySelector(".container_chart_info");
    chart_info.innerHTML = "";
    chart_info.appendChild(fragment);
}
const displayError = (error) =>{
    const form = document.querySelector(".container_form");
    if (!form.firstElementChild.classList.contains("message_error")){
        let error_div = document.createElement("DIV");
        error_div.classList.add("message_error");
        error_div.textContent = error;
        form.insertBefore(error_div,form.firstElementChild)
        setTimeout(()=> form.removeChild(form.firstElementChild),3000);
    }
}

//Initialize the inputs
let fragment = document.createDocumentFragment();
    for (let i = 0;i < count_value; i++){
        let div = document.createElement("DIV");
        div.classList.add("fieldset_input");
        div.innerHTML = `<input type="text" name="data" placeholder="Type dataname" class="dataname_input" maxlength="25">
                         <input type="number" name="value" placeholder="Type value" step="0.005" min="0" max="1000000" class="value_input">
                         <input type="color" name="color" class="color_input">`;
        fragment.appendChild(div);
    }
input_fieldset.appendChild(fragment);

//Control the width of chart title
chart_name.addEventListener("input",() => chart_name.style.width = (chart_name.value.length < 23) ? "400px" : `${chart_name.value.length}ch`);
//Update number of inputs to use
input_counter.addEventListener("change",()=>{
    if (input_counter.value > 1 && input_counter.value < 11){
        if (input_counter.classList.contains("input_error")) input_counter.classList.remove("input_error");
        generateInputs(input_counter.value,input_fieldset)
    } else {
        input_counter.classList.add("input_error");
        displayError("You can add 2 to 10 values only");
    }
})
//Generates the chart
generate_button.addEventListener("click",(e)=>{
    e.preventDefault();
    const validate_dataname = /^\w+(\s\w+){0,}$/;
    const validate_hexcolor = /^#[0-9A-F]{6}$/i;
    const dataname_inputs = document.querySelectorAll(".dataname_input");
    const value_inputs = document.querySelectorAll(".value_input");
    const color_inputs = document.querySelectorAll(".color_input");
    validateInputs(dataname_inputs,validate_dataname,1,20)
        .then(() => { return validateValueRange(dataname_inputs,1,25) })
        .then(() => { return validateNumberValues(value_inputs,0,1000000) })
        .then(()=> { return validateInputs(color_inputs,validate_hexcolor) })
        .then(() => { 
            //The chart is generated here
            let fragment = document.createDocumentFragment();
            let reference_value = getHighestValue(value_inputs);
            for (let i = 0; i < dataname_inputs.length;i++){
                let bar = document.createElement("DIV");
                bar.classList.add("chart_bar");
                let bar_value = parseFloat(value_inputs[i].value);
                bar_value = (bar_value / reference_value) * 100;
                bar.style.background = `linear-gradient(to bottom, transparent ${100 - bar_value.toFixed(2)}%, ${color_inputs[i].value} 0%)`;
                fragment.appendChild(bar);
            }
            const chart_display = document.querySelector(".container_chart_bars");
            chart_display.innerHTML = "";
            chart_display.appendChild(fragment);
            //Steps are displayed
            let step = reference_value / 4;
            const display_step = document.querySelectorAll(".value-fragment");
            for (let i = 0;i < 4; i++){
                let step_value = reference_value - (step * i);
                step_value = (step_value % 1 != 0) ? step_value.toFixed(3) : step_value;
                display_step[i].innerHTML = `<span>${step_value}</span>`;
            }
            displayDataname(dataname_inputs,color_inputs);
        })
        .catch(e => displayError(e));
})