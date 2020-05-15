let valInLocal = JSON.parse(localStorage.getItem("item"));

if (valInLocal != undefined) {
  localStorage.setItem("item", "false")
}


localStorage.setItem("item", JSON.stringify("true"));
localStorage.clear();

  console.log(items)

  

  console.log(items)