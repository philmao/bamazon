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
	// console.log("printProductList");

	conn.query("SELECT * FROM products", function (err, result, fields) {
		if (err) throw err;
		var data = [];
		var t = new Table;

		console.log("\nProduct Inventory List: ");
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

};
function printLowInventory(func) {
	// console.log("printLowInventory");

	conn.query("SELECT * FROM products WHERE stock_quantity<=5", function (err, result, fields) {
		if (err) throw err;
		var data = [];
		var t = new Table;

		console.log("\nLow Inventory List: ");
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

function addInventory(id, quantity, func) {
	// console.log("addInventory");
	// console.log(id, quantity);
	var totalQuantity = 0; 
	conn.query("SELECT * FROM products WHERE item_id=?", [id], function (err, result, fields) {
		if (err) throw err;
		// console.log(result[0].stock_quantity);
		totalQuantity = parseInt(result[0].stock_quantity) + parseInt(quantity);
		// console.log(totalQuantity);

		conn.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [totalQuantity, id ], function (err, result, fields) {
			if (err) throw err;
			console.log("\nSuccessfully added quantity " + quantity + " for item, " + id + "\n\n");

			func();

		});
	});
}

function addNewProduct(name, dept, price, quantity, func) {
	// console.log("addNewProduct");
	// console.log(name, dept, price, quantity);

	conn.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", [name, dept, price, quantity], function (err, result, fields) {
		if (err) throw err;
		console.log("\nSuccessfully added new product\n\n");

		func();

	});

}

function selectAction() {
	inquirer.prompt([
		{
			type: "list",
			name: "select",
			message: "Please select an action:",
			choices: [
				"View products for sale", 
				"View low inventory", 
				"Add to inventory", 
				"Add new product"
			]
		},
		{
			type: "input",
			name: "product_id",
			message: "Please select product_id:",
			validate: function(str) {
				return str !== '' && str.length === 3;
			},
			when: function(answers) {
				return answers.select === 'Add to inventory';
			}

		},
		{
			type: "input",
			name: "quantity",
			message: "Please enter quantity to be added:",
			validate: function(str) {
				return str !== '';
			},
			when: function(answers) {
				return answers.select === 'Add to inventory';
			}

		},
		{
			type: "input",
			name: "desc",
			message: "Please enter description for new product:",
			validate: function(str) {
				return str !== '';
			},
			when: function(answers) {
				return answers.select === 'Add new product';
			}

		},
		{
			type: "input",
			name: "dept",
			message: "Please enter department for new product:",
			validate: function(str) {
				return str !== '';
			},
			when: function(answers) {
				return answers.select === 'Add new product';
			}

		},
		{
			type: "input",
			name: "price",
			message: "Please enter price for new product:",
			validate: function(str) {
				return str !== '';
			},
			when: function(answers) {
				return answers.select === 'Add new product';
			}

		},
		{
			type: "input",
			name: "quantity",
			message: "Please enter quantity:",
			validate: function(str) {
				return str !== '';
			},
			when: function(answers) {
				return answers.select === 'Add new product';
			}

		}
	]).then(function(result) {
		// console.log(result.select);

		switch(result.select) {
			case 'View products for sale':
				printProductList(selectAction);
				break;
			case 'View low inventory':
				printLowInventory(selectAction);
				break;
			case 'Add to inventory':
				addInventory(result.product_id, result.quantity, selectAction);
				break;
			case 'Add new product':
				addNewProduct(result.desc, result.dept, result.price, result.quantity, selectAction);
				break;
			default:
				console.log("Error: invalid option");
		}

	});
}

conn.connect(function(err) {
	if (err) throw err;

});

console.log("Welcome to Bamazon Manager View!\n");

selectAction();

