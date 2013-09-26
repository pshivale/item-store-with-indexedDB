var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
var db;
(function () {     
    var itemData = [
        { name: "Aminophylline : 225 mg", type: "Tablet", price: "5.09" },
        { name: "Vit E : 100 mg", type: "Capsule", price: "5.34" },
        { name: "Analgin : 500 mg", type: "Injection", price: "4.54" },
        { name: "Analgin : 500 mg", type: "Tablet", price: "8.27" },
        { name: "Aspirin : 50 mg", type: "Tablet", price: "1.1" }
    ];

    function initDb() {
        var request = indexedDB.open("ItemDB", 1);  
        request.onsuccess = function (evt) {
            db = request.result;                                                            
        };

        request.onerror = function (evt) {
            console.log("IndexedDB error: " + evt.target.errorCode);
        };

        request.onupgradeneeded = function (evt) {                   
            var objectStore = evt.currentTarget.result.createObjectStore(
                     "item", { keyPath: "id", autoIncrement: true });

            objectStore.createIndex("name", "name", { unique: false });

            for (i in itemData) {
                objectStore.add(itemData[i]);
            }
        };
    }

    function contentLoaded() {
        initDb();                
        var btnAdd = document.getElementById("btnAdd");
        var btnDelete = document.getElementById("btnDelete");
        var btnPrint = document.getElementById("btnPrint");
        var reinitialize_db = document.getElementById("reinitialize_db");
	var btnSearch = document.getElementById("btnSearch");
        btnAdd.addEventListener("click", function () {
            var name = $("#name").val();
            var price = $("#price").val();

            // var transaction = db.transaction("item", IDBTransaction.READ_WRITE);
            var transaction = db.transaction(["item"], "readwrite")
            var objectStore = transaction.objectStore("item");                    
            var request = objectStore.add({ name: name, price: price });
            request.onsuccess = function (evt) {
                // do something after the add succeeded
            };
        }, false);

	btnSearch.addEventListener("click", function () {
            var searchString = $("#srchString").val();
	    var transaction = db.transaction(["item"], "readonly");
            var store = transaction.objectStore("item");                    
	    var index = store.index("name");
	    var request = index.get(searchString);
        var search_products_tbody = $("#search_products_tbody");
            search_products_tbody.html('');
	    request.onsuccess = function() {
		var record = request.result;
		if (record !== undefined) {
            search_products_tbody.append("<tr>"
                        + getCell(record.name)
                        + getCell(record.price)
                        + "</tr>");
		} else {
		    // No match was found.
		    console.log("no match found");
		}
	    };

            request.onerror = function (ev) {
                console.log("index.get failed. Error: " + ev.message);
             }
        }, false);

        reinitialize_db.addEventListener("click", function () {

            var transaction = db.transaction(["item"], "readwrite");//db.transaction("item", IDBTransaction.READ_WRITE);
            var objectStore = transaction.objectStore("item");
            objectStore.clear().onsuccess = function(event) {
                console.log("Database cleared");
            };
            transaction = db.transaction(["item"], "readwrite");//db.transaction("item", IDBTransaction.READ_WRITE);
            objectStore = transaction.objectStore("item");
            for (i in itemData) {
                objectStore.add(itemData[i]);
            }
        }, false);

        // btnDelete.addEventListener("click", function () {
        //     var id = document.getElementById("txtID").value;

        //     var transaction = db.transaction(["item"], "readwrite");//db.transaction("item", IDBTransaction.READ_WRITE);
        //     var objectStore = transaction.objectStore("item");
        //     var request = objectStore.delete(id);
        //     request.onsuccess = function(evt) {  
        //         // It's gone!  
        //     };
        // }, false);

        btnPrint.addEventListener("click", function () {
            var products_tbody = $("#products_tbody");
            products_tbody.html('');
            var transaction = db.transaction(["item"], "readwrite")//= db.transaction("item", IDBTransaction.READ_WRITE);
            var objectStore = transaction.objectStore("item");

            var request = objectStore.openCursor();
            request.onsuccess = function(evt) {  

                var cursor = evt.target.result;  
                if (cursor) {  
                    products_tbody.append("<tr>"
                        // + getCell(cursor.key)
                        + getCell(cursor.value.name)
                        + getCell(cursor.value.price)
                        + "</tr>");
                    // products_tbody.append("<tr><td>"+cursor.key+"</td><td>"+cursor.value.name+"</td></tr>");                         
                    cursor.continue();  
                }  
                else {  
                    console.log("No more entries!");  
                }  
            };  
        }, false);              
    }

    window.addEventListener("DOMContentLoaded", contentLoaded, false); 
})();       

function getCell(value){
    return "<td>" + value + "</td>";
}
