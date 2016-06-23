/**
 * "getXHR" function.
 * PARAM : 	void.
 * RETURN : a newly created XMLHttpRequest object.
 * PURPOSE : Create a XMLHttpRequest object with backwards compatibility with IE 6 and older for data exchange with the server. Warn the user if the web browser cannot use XMLHttpRequest (or ActiveXObject for older versions of IE).
 */
function getXHR(){
	
	var xhr = null; //XMLHttpRequest object.
	
	if(window.XMLHttpRequest || window.ActiveXObject){ //test for compatibility with XMLHttpRequest or ActiveXObject for data exchange with the server. Having none of them is unlikely.
		if(window.ActiveXObject){ //IE 6 and older versions.
			try{
				xhr = new ActiveXObject("Msxm12.XMLHTTP");
			} catch(e){
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else { //other web browsers.
			xhr = new XMLHttpRequest();
		}
	} else { //homemade web browser (?). Unlikely to get called.
		alert("Your web browser does not support XMLHttpRequest and cannot exchange with the web server.");
		return null;
	}
	
	return xhr;
}


/**
 * "xmlRequest" function.
 * PARAM : callback - callback function to call when the XML tree is loaded.
 * RETURN : void.
 * PURPOSE : create a synchronous XMLHttpRequest with backwards compatibility with IE 6 and older, stored in an existing "xhr" variable. Only one request can be processed at a time. Any new request will be ignored until the previous one is completed. The XMLHttpRequest object retrieves the "\res\contents.xml" file's content as a XML tree. Then it is send to the callback function.
 */
function xmlRequest(callback){
	if(xhr && xhr.readyState !=0){ //we block new request if the previous one is still pending.
		xhr.abort(); 
	}
	
	xhr = getXHR(); //get the XMLHttpRequest object.
	
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)){
			callback(xhr.responseXML);
		}
	};
	
	xhr.open("GET", "./res/contents.xml", false);
	xhr.send(null);
}
/**
 * "readData" function.
 * PARAM :	 data - incoming data.
 * RETURN :	 incoming data or null if the data was not received.
 * PURPOSE : retrieves all the data from the "\res\contents.xml" file. Alert the user if the content could not be retrieved.
 */
function readData(data){
	if(data){ //returns all the data
		DATA = data;
	} else { //unlikely to be called.
		alert("No data retrieved, check for \res\contents.xml");
		DATA = null;
	}
}

/**
 * "readPartData" function.
 * PARAM : 	data - incoming data.
			partNumber - the part in which take the information. The other parts' information is discarded.
 * RETURN :	the partNumber-th part's information from the "\res\contents.xml" file or null if the data is empty or the part does not exist.
 * PURPOSE : retrieves only the partNumber-th part's information from the "\res\contents.xml". The function returns null if the data is empty or the part does not exist. 
 */
function readPartData(data, partNumber){
	if(data){
		var partData = data.getElementsByTagName("part");
		for(i=0, parts=partData.length; i<parts; i++){
			var id = partData[i].getAttribute("id");
			if(id && parseInt(id) == partNumber){
				return partData[i];
			}
		}
	}	
	return null;
}
/**
 * "readScreenData" function.
 * PARAM : 	data - incoming data.
 *			screenNumber - the screen in which take the information. The other screens' information is discarded.
 * RETURN :	the screenNumber-th screen's information from the "\res\contents.xml" file or null if the data is empty or the screen does not exist.
 * PURPOSE : retrieves only the screenNumber-th screen's information from the "\res\contents.xml". The function returns null if the data is empty or the screen does not exist. 
 */
function readScreenData(data, screenNumber){
	if(data){
		var screenData = data.getElementsByTagName("screen");
		for(i=0, screens=screenData.length; i<screens; i++){
			var id = screenData[i].getAttribute("id");
			if(id && parseInt(id) == screenNumber){
				return screenData[i];
			}
		}
	}
	return null;
}

function readQuizAnswersData(data){
	if(data){
		return data.getElementsByTagName("answer");
	}
	return null;
}

function readExplanationData(data){
	if(data){
		return data.getElementsByTagName("explanation");
	}
	return null;
}

function readImageData(data){
	if(data){
		return data.getElementsByTagName("image")[0];
	}
	return null;
}

/**
 * getNodeValue function.
 * PARAM : 	data - incoming data in which taking the node text value.
 *			node - the name of the node.
 * RETURN :	the text value of the node.
 * PURPOSE : Alias for "data.getElementsByTagName(node)[0].childNodes[0].nodeValue;". Used when retrieving data from a unique node in a XML branch. Example : the data is of a "screen" xml element and contains 4 child nodes with different names. Then "getNodeValue()" is used to get the content of these child nodes with different names. If multiple nodes have the same name, only the content of the first one will be retrieved.
 */
function getNodeValue(data, node){
	if(data){
		return data.getElementsByTagName(node)[0].childNodes[0].nodeValue;
	}
	return null;
}

/* ----------------------------------- */

/**
 *　getNodes function.
 * PARAM : 	data - the xml tree or subtree in which take data.
 *			nodes - the nodes' name to extract from the xml tree.
 * RETURN :	an array of all the nodes extracted or null if the data does not exist.
 * PURPOSE : get all nodes from a xml tree or subtree as an array. Used when multiple nodes with the same name exist and we want to retrieve them all.
 */
function getNodes(data, nodes){
	if(data){
		//alert(data);
		return data.getElementsByTagName(nodes);
	}
	return null;
}

/**
 * getUniqueNode function.
 * PARAM :	data - the xml tree or subtree in which to take data.
 *			node - the node's name to extract from the xml tree.
 * RETURN :	the node extracted from the xml tree or subtree.
 * PURPOSE : get a unique node from a xml tree or subtree. Used when only a single node with a specific name exist and we want to retrieve it.
 */
function getUniqueNode(data, node){
	if(data){
		return data.getElementsByTagName(node)[0];
	}
	return null;
}

/**
 * getIdNode function.
 * PARAM :	data - the xml tree or subtree in which to take data.
 *			id - the id as an integer of the node to extract.
 * RETURN :	the node with the correct ID or null if the data is empty or the ID does not exist.
 * PURPOSE : get a specific node with an ID attribute ("id") from a xml tree or subtree. Does not check for the node name. If different nodes with different names have an ID attribute they should first sorted with getNodes().
 */
 function getIdNode(data, id){
	 if(data){
		 //alert(data);
		 for(i=0, l=data.length; i<l; i++){
			var nodeId = data[i].getAttribute("id");
			if(parseInt(nodeId) == id){
				return data[i];
			}
		 }
	 }
	 return null;
 }
 