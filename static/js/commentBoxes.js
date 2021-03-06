// Easier access to outter pad
var padOuter;
var getPadOuter = function() {
  padOuter = padOuter || $('iframe[name="ace_outer"]').contents();
  return padOuter;
}

var getCommentsContainer = function() {
  return getPadOuter().find("#comments");
}

/* ***** Public methods: ***** */

var showComment = function(commentId, e) {
  var commentElm = getCommentsContainer().find('#'+ commentId);
  commentElm.show();

  highlightComment(commentId, e);
};

var hideComment = function(commentId, hideCommentTitle) {
  var commentElm = getCommentsContainer().find('#'+ commentId);
  commentElm.removeClass('full-display');

  // hide even the comment title
  if (hideCommentTitle) commentElm.hide();

  var inner = $('iframe[name="ace_outer"]').contents().find('iframe[name="ace_inner"]');
  inner.contents().find("head .comment-style").remove();

  getPadOuter().find('.comment-modal').removeClass('popup-show');
};

var hideAllComments = function() {
  getCommentsContainer().find('.sidebar-comment').removeClass('full-display');
  getPadOuter().find('.comment-modal').removeClass('popup-show');
}

var highlightComment = function(commentId, e, editorComment){
  var container       = getCommentsContainer();
  var commentElm      = container.find('#'+ commentId);
  var inner = $('iframe[name="ace_outer"]').contents().find('iframe[name="ace_inner"]');

  if (container.is(":visible")) {
    // hide all other comments
    container.find('.sidebar-comment').each(function() {
      inner.contents().find("head .comment-style").remove();
      $(this).removeClass('full-display')
    });

    // Then highlight new comment
    commentElm.addClass('full-display');
    // now if we apply a class such as mouseover to the editor it will go shitty
    // so what we need to do is add CSS for the specific ID to the document...
    // It's fucked up but that's how we do it..
    var inner = $('iframe[name="ace_outer"]').contents().find('iframe[name="ace_inner"]');
    inner.contents().find("head").append("<style class='comment-style'>."+commentId+"{ color: #a7680c !important }</style>");
  } else {
    // make a full copy of the html, including listeners
    var commentElmCloned = commentElm.clone(true, true);

    // before of appending clear the css (like top positionning)
    commentElmCloned.attr('style', '');
    // fix checkbox, because as we are duplicating the sidebar-comment, we lose unique input names
    commentElmCloned.find('.label-suggestion-checkbox').click(function() {
      $(this).siblings('input[type="checkbox"]').click();
    })

    // hovering comment view
    getPadOuter().find('.comment-modal-comment').html('').append(commentElmCloned);
    var padInner = getPadOuter().find('iframe[name="ace_inner"]')
    // get modal position
    var containerWidth = getPadOuter().find('#outerdocbody').outerWidth(true);
    var modalWitdh = getPadOuter().find('.comment-modal').outerWidth(true);
    var targetLeft = e.clientX;
    var targetTop = $(e.target).offset().top;
    if (editorComment) {
      targetLeft += padInner.offset().left;
      targetTop += parseInt(padInner.css('padding-top').split('px')[0])
      targetTop += parseInt(padOuter.find('#outerdocbody').css('padding-top').split('px')[0])
    } else {
      // mean we are clicking from a comment Icon
      var targetLeft = $(e.target).offset().left - 20;
    }

    // if positioning modal on target left will make part of the modal to be
    // out of screen, we place it closer to the middle of the screen
    if (targetLeft + modalWitdh > containerWidth) {
      targetLeft = containerWidth - modalWitdh - 25;
    }
    var editorCommentHeight = editorComment ? editorComment.outerHeight(true) : 30;
    getPadOuter().find('.comment-modal').addClass('popup-show').css({
      left: targetLeft + "px",
      top: targetTop + editorCommentHeight +"px"
    });
  }
}

// Adjust position of the comment detail on the container, to be on the same
// height of the pad text associated to the comment, and return the affected element
var adjustTopOf = function(commentId, baseTop) {
  var commentElement = getPadOuter().find('#'+commentId);
  commentElement.css("top", baseTop+"px");

  return commentElement;
}

// Indicates if comment is on the expected position (baseTop-5)
var isOnTop = function(commentId, baseTop) {
  var commentElement = getPadOuter().find('#'+commentId);
  var expectedTop = baseTop + "px";
  return commentElement.css("top") === expectedTop;
}

// Indicates if event was on one of the elements that does not close comment
var shouldNotCloseComment = function(e) {
  // a comment box
  if ($(e.target).closest('.sidebar-comment').length || $(e.target).closest('.comment-modal').length) { // the comment modal
    return true;
  }
  return false;
}

exports.showComment = showComment;
exports.hideComment = hideComment;
exports.hideAllComments = hideAllComments;
exports.highlightComment = highlightComment;
exports.adjustTopOf = adjustTopOf;
exports.isOnTop = isOnTop;
exports.shouldNotCloseComment = shouldNotCloseComment;
