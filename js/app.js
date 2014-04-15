var calendar = (function () {
	var $eventsContainer = $('.events-container');

	// revealing not only the main method - layOutDay, but additional as well to be able to unit test them 
	return {
		layOutDay: layOutDay,
		compareEvents: compareEvents,
		groupOverlaping: groupOverlaping,
		positionEvents: positionEvents
	};

	
	/**
	* Process events list and put them on calendar layout.
	*
	* @param {Array} List of JSON events. Each event contains start and end value
	* @return {undefined}
	*/
	function layOutDay (events) {
		var eventsCollection = getValidEvents(events);
		$eventsContainer.empty();
		eventsCollection.sort(compareEvents);
		var groups = groupOverlaping(eventsCollection);
		groups.forEach(function (group) {
			var positionedEvents = positionEvents(group.items);
			positionedEvents.forEach(function (event) {
				var width = 600 / event.overlaps;
				renderEvent({width: width, left: event.column * width, height: event.end - event.start, top: event.start});
			});
		});
		return eventsCollection;
	}

	function getValidEvents (events) {
		var eventsCollection = [];
		events.forEach(function (event) {
			if (event && event.start && event.end) { 
				eventsCollection.push(event);
			} else {
				console.log('you passed not valid event object');
			}
		});
		return eventsCollection;
	}

	/**
	* Displays the event on specifying position.
	*
	* @param {Object} Event enriched by position data
	* @return {undefined}
	*/
	function renderEvent (event) {
		var style = 'width: ' + event.width + 'px;height: ' + event.height + 'px;top: ' + event.top + 'px;left: ' + event.left + 'px;',
			eventHtml = '<div class="event" style="' + style + '"><div class="bar"></div><div class="content">' + 
										'<div class="title">Sample Item</div><div class="location">Sample Location</div></div></div>';
		$eventsContainer.append(eventHtml);
	}

	function compareEvents (event1, event2) {
		if (event1.start < event2.start) {
			return -1;
		}
		if (event1.start > event2.start) {
			return 1;
		}
		return event1.end >= event2.end ? -1 : 1; 
	}

	/**
	* Intended to group overlaping events.
	*
	* @param {Array} List of raw events
	* @return {Array} List of grouped events
	*/
	function groupOverlaping (events) {
		var groups = [];
		for(var i = 0; i < events.length; i++) {
			var event = events[i],
				groupIndex = getEventGroupPositions(event, groups),
				eventStartGroup = groupIndex.start,
				eventEndGroup = groupIndex.end;

			if (eventStartGroup >= 0) {
				if (eventEndGroup < 0) {
					// existing groups only include event.start, corresponding group.end should be reset to event.end
					groups[eventStartGroup].end = event.end;
					groups[eventStartGroup].items.push(event);
				} else {
					// existing groups include event.start and event.end
					if (eventStartGroup == eventEndGroup) {
						groups[eventStartGroup].items.push(event);
					}
				}
			} else {
				if (eventEndGroup < 0) {
					// no existing groups include event.start and event.end
					var newGroup = {start: event.start, end: event.end, items: [event]};
					groups.push(newGroup);
				} else {
					// existing groups include only event.end, corresponding group.start should be reset to event.start
					groups[eventStartGroup].start = event.start;
					groups[eventStartGroup].items.push(event);
				}
			}
		}
		return groups;
	}

	function getEventGroupPositions (event, groups) {
		// try to find groups with event.start and event.end
		var eventStartGroup = -1,
			eventEndGroup = -1;
		for (var i = 0; i < groups.length; i++) {
			if (event.start >= groups[i].start && event.start <= groups[i].end) {
				eventStartGroup = i;
			}
			if (event.end >= groups[i].start && event.end <= groups[i].end) {
				eventEndGroup = i;
			}
		}
		return { start: eventStartGroup, end: eventEndGroup };
	}


	/**
	* Intended to pick up correct place for each event. It means we have to find event column number and count of overlaping events. 
	*
	* @param {Array} List of overlaping events
	* @return {Array} List of overlaping events. Each item in list enriched with position data
	*/
	function positionEvents (events) {
		var positionedEvents = [],
			level = 0;
			
		while (events.length) {
			var minStart = events[0].start;
			// check if overlaping events overlap with each other
			for (var i = 0; i < events.length; i++) {
				if (events[i].start < minStart) { continue; }
				events[i].column = level;
				positionedEvents.push(events[i]);
				minStart = events[i].end;
				events.splice(i,1);
				i--;
			}
			level++;
		}

		positionedEvents.forEach(function (event) {
			event.overlaps = level;
		});
		return positionedEvents;
	}

})();

var layOutDay = calendar.layOutDay;
layOutDay([{start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670}]);
