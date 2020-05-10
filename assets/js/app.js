console.log("WUT");
$(document).on("click", ".cTitle", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  const thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2 class='mx-auto text-center'>" + data.title + "</h2>");
//       <input class="form-control form-control-lg" type="text" placeholder=".form-control-lg">
// <input  type="text" placeholder="Default input"></input>
      // An input to enter a new title

      $("#notes").append("<p>Title</p>");

      $("#notes").append("<input id='titleinput' class='form-control' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<p>Content</p>");
      $("#notes").append("<textarea id='bodyinput' class='form-control' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<div class='mx-auto text-center'><button data-id='" + data._id + "' id='savenote' class='btn btn-primary mb-2'>Post a comment!</button></div>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  const thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
