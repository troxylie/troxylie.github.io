"use strict";

import * as Con from "./confetti.js";

{
	const scriptsInEvents = {

		async GameSheet_Event12(runtime, localVars)
		{
			setTimeout(function(){
			    Con.confetti.start(500);
			}, 500);
		}

	};
	
	self.C3.ScriptsInEvents = scriptsInEvents;
}
