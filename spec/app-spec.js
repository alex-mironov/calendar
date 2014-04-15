describe('Calendar', function () {
	
	it('should validate events', function () {
		var renderedEvents = layOutDay([{start: 150}, {start: 30, end: 150}, {start: 90, end: 120}]);
		expect(renderedEvents.length).toEqual(2);
		expect(renderedEvents[0].start).toEqual(30);
		expect(renderedEvents[1].start).toEqual(90);
	});

	it('should group overlapping events by time', function () {
		var groups = calendar.groupOverlaping([{start: 30, end: 90}, {start: 100, end: 120}, {start: 110, end: 150}, {start: 150, end: 240}, {start: 100, end: 115}]);
		expect(groups.length).toEqual(2);
		expect(groups[0]).toEqual(jasmine.objectContaining({
			start: 30,
			end: 90	
		}));
		expect(groups[1]).toEqual(jasmine.objectContaining({
			start: 100,
			end: 240
		}));
	});

	describe('when sorting events', function () {
		it('should compare by start time', function () {
			var res = calendar.compareEvents({start: 30, end: 150}, {start: 90, end: 120});
			expect(res).toEqual(-1);
		});
		it('should compare events by end time if start time the same', function () {
			var res = calendar.compareEvents({start: 30, end: 150}, {start: 30, end: 120});
			expect(res).toEqual(-1);
		});
	});
	
	describe('when position events', function () {
		it('should find out event\'s overlaps degree and column number', function () {
			var positionedEvents = calendar.positionEvents([{start: 30, end: 120}, {start: 90, end: 150}]);
			expect(positionedEvents.length).toEqual(2);

			expect(positionedEvents[0].overlaps).toEqual(2);
			expect(positionedEvents[0].column).toEqual(0);

			expect(positionedEvents[1].overlaps).toEqual(2);
			expect(positionedEvents[1].column).toEqual(1);
		});

		it('should push event to previous column if it\'s free (in case of colliding)', function () {
			var positionedEvents = calendar.positionEvents([{start: 30, end: 120}, {start: 90, end: 150}, {start: 120, end: 150}]);
			var event; 
			for (var i = positionedEvents.length - 1; i >= 0; i--) {
				event = positionedEvents[i];
				if (event.start == 120 && event.end == 150) {
					break;
				}
			}
			expect(event.column).toEqual(0);
		});

		it('should take full width if there are no colliding events', function () {
			var positionedEvents = calendar.positionEvents([{start: 30, end: 120}]);
			var event = positionedEvents[0];
			expect(event.column).toEqual(0);
			expect(event.overlaps).toEqual(1);
		});

		it('colliding events shold divide width between each other', function () {
			var positionedEvents = calendar.positionEvents([{start: 30, end: 120}, {start: 90, end: 150}]);

			expect(positionedEvents[0].overlaps).toEqual(2);
			expect(positionedEvents[0].column).toEqual(0);

			expect(positionedEvents[1].overlaps).toEqual(2);
			expect(positionedEvents[1].column).toEqual(1);
		});
	});
	
});