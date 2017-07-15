var mysql = require('mysql');
var Table = require('easy-table');
var inquirer = require('inquirer');

var conn = mysql.createConnection({
	host: "localhost",
	user: "phil",
	password: "p4ssword",
	database: "bamazon"
});


function printProductList(func) {

	conn.query("SELECT * FROM products", function (err, result, fields) {
		if (err) throw err;

		var data = [];
		var t = new Table;

		for(var i = 0; i < result.length; i++) {

			data[i] = { 
				id: result[i].item_id, 
				name: result[i].product_name, 
				dept: result[i].department_name, 
				price: result[i].price, 
				quantity: result[i].stock_quantity
			};

		};
		data.forEach(function(result) {
			t.cell("item_id", result.id);
			t.cell("product_name", result.name);
			t.cell("department_name", result.dept);
			t.cell("price", result.price, Table.number(2));
			t.cell("quantity", result.quantity);
			t.newRow();
		})
		console.log(t.toString());

		func();
	});

}

function inquirerAction() {
	// console.log("inquirerAction");

	inquirer.prompt([
	{
		type: "input",
		name: "item_id",
		message: "Which item ID would like to buy?",
		validate: function(str) {
			return (str !== "") && (str.length === 3);
		}
	},
	{
		type: "input",
		name: "quantity",
		message: "How many units of the product they would like to buy?"
	}
	]).then(function(answer) {
		// console.log(answer.item_id);
		// console.log(answer.quantity);

		queryItem(answer.item_id, parseInt(answer.quantity));
	})
}

function queryItem(item_id, quantity) {
	// console.log(item_id);
	// console.log(quantity);

	conn.query("SELECT * FROM products WHERE item_id=?", item_id, function (err, result, fields) {
		if (err) throw err;

		var name = result[0].product_name;
		var price = result[0].price;
		var total_cost = price * quantity;

		if(quantity <= result[0].stock_quantity ) {
			var new_quantity = result[0].stock_quantity - quantity;
			// console.log(new_quantity);

			conn.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [new_quantity, item_id], function (err, res, fields) {
				if (err) throw err;

				console.log("\n\nCongratuations!\nYou have ordered a quantity of " + quantity + " of item, " + name);
				console.log("Total cost of the order is $" + total_cost.toFixed(2) + "\n\n" );
				printProductList(inquirerAction);

			});
		}
		else {
			console.log("\n\nError: insufficient quantity.\n\n");
			printProductList(inquirerAction);
		}

	});
}

printProductList(inquirerAction);

