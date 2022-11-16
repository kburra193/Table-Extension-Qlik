define([], function() {
    /**
     * Set column to be first in sort order
     * @param self The extension
     * @param col Column number, starting with 0
     */
    function setSortOrder(self, col) {
        //set this column first
        var sortorder = [col];
        //append the other columns in the same order
        self.backendApi.model.layout.qHyperCube.qEffectiveInterColumnSortOrder.forEach(function(val) {
            if (val !== sortorder[0]) {
                sortorder.push(val);
            }
        });
        self.backendApi.applyPatches([{
            'qPath': '/qHyperCubeDef/qInterColumnSortOrder',
            'qOp': 'replace',
            'qValue': '[' + sortorder.join(',') + ']'
        }], true);
    }

    /**
     * Reverse sort order for column
     * @param self The extension
     * @param col The column number, starting with 0
     */
    function reverseOrder(self, col) {
        var hypercube = self.backendApi.model.layout.qHyperCube;
        var dimcnt = hypercube.qDimensionInfo.length;
        var reversesort = col < dimcnt ? hypercube.qDimensionInfo[col].qReverseSort :
            hypercube.qMeasureInfo[col - dimcnt].qReverseSort;
        self.backendApi.applyPatches([{
            'qPath': '/qHyperCubeDef/' +
                (col < dimcnt ? 'qDimensions/' + col : 'qMeasures/' + (col - dimcnt)) +
                '/qDef/qReverseSort',
            'qOp': 'replace',
            'qValue': (!reversesort).toString()
        }], true);
    }

    return function($element, layout) {
        console.log(layout);
        var self = this;
        // Obj ID
        var objid = layout.qInfo.qId
        // Backend API
        var backendApi = this.backendApi;

        // Get the text color value
        var textColor = layout.textColor;

        // Clear the previous contents of the container so we start from scratch each time
        $element.html("");

        // Create a table
        var table = document.createElement("table");

        // Create a header row
        var hRow = document.createElement("tr");

        //Create Sort Order
        var sortorder = this.backendApi.model.layout.qHyperCube.qEffectiveInterColumnSortOrder;

        // Add dimension labels
        var dimensionInfo = layout.qHyperCube.qDimensionInfo;
        for (var i = 0; i < dimensionInfo.length; i++) {
            // Create a header cell
            var hCell = document.createElement("th");
            // Set the cell contents to the dimension label
            hCell.innerHTML = dimensionInfo[i].qFallbackTitle;
            // Add metadata for the selection
            hCell.setAttribute("data-col", i);
            hCell.setAttribute("order", dimensionInfo[i].qSortIndicator);
            //sort Ascending or Descending ?? add arrow
            // Sort Logic from here
            if (dimensionInfo[i].qSortIndicator === 'A') {
                let icon = document.createElement("i");
                icon.className = "lui-icon--triangle-top";
                if (sortorder && sortorder[0] !== i) {
                    icon.className = "lui-icon--triangle-top secondary";
                }
                hCell.append(icon);
            } else if (dimensionInfo[i].qSortIndicator === 'D') {
                let icon = document.createElement("i");
                icon.className = "lui-icon--triangle-bottom";
                if (sortorder && sortorder[0] !== i) {
                    icon.className = "lui-icon--triangle-bottom secondary";
                }
                hCell.append(icon);
            }

            // Add the cell to the header row
            hRow.appendChild(hCell);
        }

        // Add measure labels
        var measureInfo = layout.qHyperCube.qMeasureInfo;
        for (var i = 0; i < measureInfo.length; i++) {
            // Create a header cell
            var hCell = document.createElement("th");
            // Set the cell contents to the measure label
            hCell.innerHTML = measureInfo[i].qFallbackTitle;
            // Set the class as a measure cell
            hCell.className = "measureCell";
            // Add the cell to the header row
            hRow.appendChild(hCell);
        }

        // Add the header row to the table
        table.appendChild(hRow);

        //render data
        var hypercube = layout.qHyperCube;
        var rowcount = hypercube.qDataPages[0].qMatrix.length;
        var dimCount = hypercube.qDimensionInfo.length;
        var mesCount = hypercube.qMeasureInfo.length;

        var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
        console.log(qMatrix);

        // Iterate through each row of the qMatrix
        for (var row = 0; row < qMatrix.length; row++) {
            // Get current row data
            var currentRow = qMatrix[row];
            // Create a row
            var tr = document.createElement("tr");
            // Iterate through each column of the row
            for (var col = 0; col < currentRow.length; col++) {
                // Get current cell data
                var currentCell = currentRow[col];
                // Create a cell
                var td = document.createElement("td");
                // Add text value to the cell
                td.innerHTML = currentCell.qText;

                // Check if dimension, then add metadata
                if (col < dimensionInfo.length) {
                    // Add a selectable class
                    td.className = "selectable";
                    // Add metadata for the selection
                    td.setAttribute("dim-col", col);
                    td.setAttribute("dim-index", currentCell.qElemNumber);
                }
                // If a measure cell, set the style
                else {
                    td.className = "measureCell";
                }
                // Append the cell to the row
                tr.appendChild(td);
            }
            // append the row to the table
            table.appendChild(tr);
        }
        // Append the table to the $element
        $element.append(table);

        // Add click functions to ".selectable" items
        $element.find('.selectable').on('qv-activate', function() {
            if (this.hasAttribute("dim-index")) {
                var value = parseInt(this.getAttribute("dim-index"), 10), // Get the dimension value index
                    dim = parseInt(this.getAttribute("dim-col"), 10); // Get the dimension column number
                // Call selectValues with these values
                self.selectValues(dim, [value], true);
                $element.find("[dim-col='" + dim + "'][dim-index='" + value + "']").toggleClass("selected");
            }
        });

        // click/activate functions to "sort" column values
        $element.find('th').on('qv-activate', function() {
            if (this.hasAttribute("data-col")) {
                var col = parseInt(this.getAttribute("data-col"), 10);
                setSortOrder(self, col);
            }
        });

        // click/activate functions to "reverse-sort" column values
        $element.find('th i').on('qv-activate', function() {
            var parent = this.parentNode;
            if (parent.hasAttribute("data-col")) {
                var col = parseInt(parent.getAttribute("data-col"), 10);
                reverseOrder(self, col);
            }
        });


        // Color the table
        table.style.color = textColor;


    };
});