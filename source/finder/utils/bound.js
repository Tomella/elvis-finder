function getBounds(bounds, restrictTo) {
   let fq;

   let left, right, top, bottom;

   if (restrictTo) {

      left = Math.max(bounds.getWest(), -180, restrictTo.getWest());
      right = Math.min(bounds.getEast(), 180, restrictTo.getEast());
      top = Math.min(bounds.getNorth(), 90, restrictTo.getNorth());
      bottom = Math.max(bounds.getSouth(), -90, restrictTo.getSouth());


      fq = "location:[" +
         (bottom > top ? top : bottom) + "," +
         (left > right ? right : left) + " TO " +
         top + "," +
         right + "]";

   } else {
      bottom = Math.max(bounds.getSouth(), -90);
      left = Math.max(bounds.getWest(), -180);
      top = Math.min(bounds.getNorth(), 90);
      right = Math.min(bounds.getEast(), 180);
   }

   return "{!field f=bbox score=overlapRatio}Intersects(ENVELOPE(" + left + "," + right + "," + top + "," + bottom + "))";
}