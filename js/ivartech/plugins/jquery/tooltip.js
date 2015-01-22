function Tooltip(opt) {
	
	this.attached = false;
	this.object = $('<div class="tooltip" style="position: absolute; z-index: 999"><div class="tip"></div><div class="tooltip-content" style="position: absolute; display: inline; white-space: nowrap"><i></i><span class="tooltip-text"></span></div><button type="button" style="position: absolute; outline: none; height: 1px; width: 1px; border: none; background: transparent;"></button></div>');
	this.contentObject = $(this.object).find('.tooltip-content');
	
	if(!ivar.isSet(opt))
		opt = {};
	
	if(!ivar.isSet(opt.direction))
		opt.direction = 'bottom';
	if(!ivar.isSet(opt.text))
		opt.text = null;
	if(!ivar.isSet(opt.offset))
		opt.offset = 0;
	if(!ivar.isSet(opt.hclass))
		opt.hclass = '';
	if(!ivar.isSet(opt.id))
		opt.id = '';
	if(!ivar.isSet(opt.onblur))
		opt.onblur = null;
		
	if(!ivar.isSet(opt.tileOffset))
		opt.tileOffset = {};
	if(!ivar.isSet(opt.tileOffset.left))
		opt.tileOffset.left = 0;
	if(!ivar.isSet(opt.tileOffset.top))
		opt.tileOffset.top = 0;
		
	this.offset = opt.offset;
	this.hclass = opt.hclass;
	this.id = opt.id;
	this.onblur = opt.onblur;
	this.tileOffset = opt.tileOffset;
	this.timer = null;
	
	opt.show = false;
	opt.append = true;
	
	this.target = null;
	this.targetParent = null;
	this.targetOffset = null;
	this.targetWidth = null;
	this.targetHeight = null;
	
	this.setText(this.text);
	this.setClass(this.hclass);
	this.setId(this.id);
	
	this.show(opt);
		
	var self = this;
	$(this.object).find('button').bind('blur', function(){
		if(ivar.isSet(self.onblur)) {
			self.onblur();
		}
	});
	
	if(!ivar.isSet(this.text)) {
		$(this.object).hide();	
	}
	
	this.tooltipWidth = null;
	this.tooltipHeight = null;
	
	this.contentWidth = null;
	this.contentHeight = null;
	
};

Tooltip.prototype.setDirection = function(direction) {

	$(this.object).attr('class', 'tooltip tooltip-' + direction + ' ' + this.hclass).css({
		'top': 'auto',
		'right': 'auto',
		'left': 'auto',
		'bottom': 'auto',
		'background-position': 'none'
	});
	
	$(this.contentObject).css({
		'top': 'auto',
		'right': 'auto',
		'left': 'auto',
		'bottom': 'auto'
	});

	this.tooltipWidth = $(this.object).width();
	this.tooltipHeight = $(this.object).height();
	this.contentWidth = $(this.contentObject).width();
	this.contentHeight = $(this.contentObject).height();
	
	if(direction === 'left') {
		$(this.contentObject).css('top',-this.contentHeight/2);
		$(this.contentObject).css('right', this.tooltipWidth-1);
		$(this.object).find('.tip').css('background-position', (-1*this.tileOffset.left)+'px '+(-1*(this.tileOffset.top+this.tooltipHeight))+'px');
		$(this.object).offset({
			top:this.targetOffset.top+(this.targetHeight-this.tooltipWidth)/2,
			left:this.targetOffset.left-this.tooltipWidth+this.offset
		});
	} else if (direction === 'right') {
		$(this.contentObject).css('top',-this.contentHeight/2);
		$(this.contentObject).css('left', this.tooltipWidth-1);
		$(this.object).find('.tip').css('background-position', (-1*this.tileOffset.left)+'px '+(-1*this.tileOffset.top)+'px');
		$(this.object).offset({
			top:this.targetOffset.top+(this.targetHeight-this.tooltipWidth)/2,
			left:this.targetOffset.left+this.targetWidth+this.offset
		});
	} else if (direction === 'top') {
		$(this.contentObject).css('left',-(this.contentWidth+this.tooltipWidth)/2);
		$(this.contentObject).css('top',-$(this.contentObject).outerHeight()+1);
		$(this.object).find('.tip').css('background-position', (-1*(this.tileOffset.left+this.tooltipWidth))+'px '+(-1*this.tileOffset.top)+'px');
		$(this.object).offset({
			top:this.targetOffset.top-this.tooltipHeight+this.offset,
			left:this.targetOffset.left+(this.targetWidth-this.tooltipWidth)/2
		});
	} else if (direction === 'bottom') {
		$(this.contentObject).css('left',-(this.contentWidth+this.tooltipWidth)/2);
		$(this.contentObject).css('bottom',-$(this.contentObject).outerHeight()+1);
		$(this.object).find('.tip').css('background-position', (-1*(this.tileOffset.left+this.tooltipWidth))+'px '+(-1*(this.tileOffset.top+this.tooltipHeight))+'px');
		$(this.object).offset({
			top:this.targetOffset.top+this.targetHeight+this.offset,
			left:this.targetOffset.left+(this.targetWidth-this.tooltipWidth)/2
		});
	}
	
};

Tooltip.prototype.setTarget = function(target, append) {
	
	this.target = $(target);
	this.targetParent = $(target).parent();
	var pos = $(this.targetParent).css('position');
	
	if((pos != 'absolute')&&(pos != 'relative')) {
		$(this.targetParent).css('position', 'relative');
	}
	
	this.targetOffset = $(target).offset();
	this.targetWidth = $(target).outerWidth(false);
	this.targetHeight = $(target).outerHeight(false);
	
	if(append) {
		if(this.attached)
			$(this.object).detach();

		if($(this.targetParent).find(this.object).length == 0) {
			$(this.targetParent).append(this.object);
			this.attached = true;
		}
	}
};

Tooltip.prototype.setText = function(text) {
	this.text = text;
	$(this.contentObject).find('.tooltip-text').html(text);
};

Tooltip.prototype.updateText = function(text) {
	this.setText(text);
	this.setDirection(this.direction);
};

Tooltip.prototype.setId = function(id) {
	$(this.object).attr('id', id);
};

Tooltip.prototype.setClass = function(hclass) {
	if(!$(this.object).hasClass(hclass))
		$(this.object).addClass(hclass);
};

Tooltip.prototype.hide = function(speed) {
	if(this.timer != null) {
		clearInterval(this.timer);
		this.timer = null;
	}
	
	if(ivar.isSet(speed)) {
		$(this.object).fadeOut(speed);
	} else {
		$(this.object).hide();
	}
};

Tooltip.prototype.show = function(opt) {
	if(!ivar.isSet(opt))
		opt = {};
	if(!ivar.isSet(opt.append)) {
		opt.append = false;	
	}
	
	if(!ivar.isSet(opt.show)) {
		opt.show = true;	
	}

	if(ivar.isSet(opt.text)) {
		this.setText(opt.text);
	}
	
	if(ivar.isSet(opt.direction)) {
		this.direction = opt.direction;
	}
	
	if(ivar.isSet(opt.offset)) {
		this.offset = opt.offset;
	}
	
	if(ivar.isSet(opt.target)) {
		this.setTarget(opt.target, opt.append);
	}
	
	if(opt.show)
		if(ivar.isSet(opt.speed)) {
			$(this.object).stop(true, true).fadeIn(opt.speed);
		} else {
			$(this.object).stop(true, true).show();
		}
	
	if(ivar.isSet(opt.target)) {
		this.setDirection(this.direction);
	}

	if(ivar.isSet(this.onblur)) {
		$(this.object).find('button').focus();
	}
};

Tooltip.prototype.timedShow = function(opt, ms) {
	if(this.timer != null) {
		clearInterval(this.timer);
		this.timer = null;
	}
	
	var self = this;
	this.timer = setTimeout(function(){
		self.show(opt);
		this.timer = null;
	}, ms);
}

Tooltip.prototype.remove = function() {
	 $(this.object).remove();
};
