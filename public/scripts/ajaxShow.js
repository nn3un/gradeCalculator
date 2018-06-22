/* global $ */

//This function allows us to update the assignments grade
function reCalculateGrade(tbody, weight){
    var achieved = 0;
    var total = 0;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length; i++){
        var achievedNum = parseFloat($(rows[i]).find("td.achieved").first().text(), 10);
        achieved += achievedNum;
        var totalNum = parseFloat($(rows[i]).find("td.total").first().text(), 10);
        total += totalNum;
    }
    return (achieved*weight/total).toFixed(3);
}

//Sets up the assignment grade
$(document).ready(function(){
    var tables = $('body').find(".subassignmentTable");
    for (var i = 0; i < tables.length; i++){
        var weight = parseInt($(tables[i]).children("thead").first().find(".weight").first().text(), 10);
        var tbody = $(tables[i]).children("tbody");
        var achieved = reCalculateGrade(tbody, weight);
        var gradeClass = $(tables[i]).children("thead").first().find(".grade").first();
        gradeClass.text(achieved);
    }
});




//Allows the new Assignment form to show up
$("body").on("click", ".newSubassignmentBtn", function(){
    $(this).parent().parent().parent().parent().siblings(".newSubassignmentForm").toggle();
});

//Adds the new subassignment and adds it to the table
$("body").on("submit", ".newSubassignmentForm", function(e){
    e.preventDefault();
    var tbody = $(this).siblings(".subassignmentTable").children("tbody");
    var weight = parseInt($(this).siblings(".subassignmentTable").children("thead").first().find(".weight").first().text(), 10);
    var gradeClass = $(this).siblings(".subassignmentTable").children("thead").first().find(".grade").first();
    var actionUrl = $(this).attr("action");
    var subassignment = $(this).serialize();
    $.post(actionUrl, subassignment, function(data){
        var SubassignmentPutUrl = actionUrl+data._id;
        var SubassignmentDeleteUrl = actionUrl+data._id;
        tbody.append(
            `
            <tr data-actionUrl = "${ SubassignmentPutUrl }" data-subassignmentId = "${data._id}" >
               <td>${data.name}</td> 
               <td class="achieved">${data.achieved}</td> 
               <td> / </td>
               <td class="total">${data.total}</td> 
               <td><button class="editBtn">Edit</button><form class="deleteBtn" action="${ SubassignmentDeleteUrl }" method="POST" > <button>Delete</button></form></td>
            </tr>    
            `
            );
        var achieved = reCalculateGrade(tbody, weight);
        gradeClass.text(achieved);
        }
    );
});



//Shows the edit form when clicked
$('body').on("click", ".editBtn", function(){
    var tr = $(this).parent().parent();
    var subassignmentId = tr.attr('data-subassignmentId');
    var subassignmentName = tr.children(".name").first().text();
    var subassignmentAchieved = tr.children(".achieved").first().text();
    var subassignmentTotal = tr.children(".total").first().text();
    var subassignmentPutUrl = tr.attr("data-actionUrl");
    tr.html(
        `
        <td><input type='text' form='${subassignmentId}' name="subassignment[name]" value='${subassignmentName}'> </td>
        <td><input type='text' form='${subassignmentId}' name="subassignment[achieved]" value='${subassignmentAchieved}'></td>
        <td>/</td>
        <td><input type='text' form='${subassignmentId}' name="subassignment[total]" value='${subassignmentTotal}'></td>
        <td><button form='${subassignmentId}'> Update </button><form id='${subassignmentId}' class="editSubassignmentForm" method="POST" action="${subassignmentPutUrl}"></form></td>
        `
        );
});

//Updates the subassignment
$("body").on("submit", ".editSubassignmentForm", function(e){
    e.preventDefault();
    var tr = $(this).parent().parent();
    var tbody = tr.parent();
    var weight = parseInt(tbody.siblings("thead").first().find(".weight").first().text(), 10);
    var gradeClass = tbody.siblings("thead").first().find(".grade").first();
    var actionUrl = $(this).attr("action");
    var subassignment = $(this).serialize();
    $.ajax({
        url: actionUrl,
        data: subassignment,
        type: "PUT",
        success: function(data){
            tr.html(
            `
               <td class="name">${data.name}</td> 
               <td class="achieved">${data.achieved}</td> 
               <td> / </td>
               <td class="total">${data.total}</td> 
               <td>
                <button class="editBtn">Edit</button>
                <form class="deleteBtn" action="${ actionUrl }" method="POST" > 
                    <button>Delete</button>
                </form>
                </td>
            `
            );
            var achieved = reCalculateGrade(tbody, weight);
            gradeClass.text(achieved);
        }
        });
});

$('body').on('submit', ".deleteBtn", function(e){
    e.preventDefault();
    var actionUrl = $(this).attr('action');
    var tr = $(this).parent().parent();
    var tbody = tr.parent();
    var weight = parseInt(tbody.siblings("thead").first().find(".weight").first().text(), 10);
    var gradeClass = tbody.siblings("thead").first().find(".grade").first();
    var $deletedItem = $(this).parent().parent();
    $.ajax({
        url: actionUrl,
        deletedItem: $deletedItem,
        type: "DELETE",
        success: function(data){
            this.deletedItem.remove();
            var achieved = reCalculateGrade(tbody, weight);
            gradeClass.text(achieved);
        }
        
    }
    );
});

