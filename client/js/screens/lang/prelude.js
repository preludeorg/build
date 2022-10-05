
function displayLangErrors(errors) {
    const dcfResults = $('#dcf-results');
    dcfResults.empty();
    errors.forEach(err => dcfResults.append($('<pre class="result-1">').text(err)));
    $("#deploy-dcf").parent().css('pointer-events', errors.length === 0 ? '' : 'none');
}


export {displayLangErrors};