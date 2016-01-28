#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "DIR $DIR"
TMP_FILE_IN=`mktemp`
TMP_FILE_OUT=`mktemp`

dd if=/dev/urandom of=$TMP_FILE_IN bs=300k count=9
cmd="$DIR/../../bin/splitted $TMP_FILE_OUT < $TMP_FILE_IN --size 400k"
eval "$cmd"
ORIGINAL=`md5sum "$TMP_FILE_IN" | cut -f1 -d ' '`
SPLITTED=`cat $TMP_FILE_OUT.* | md5sum | cut -f1 -d ' '`
echo "RANDOM FILE $TMP_FILE_IN"
echo "OUT $TMP_FILE_OUT"
echo "ORIGINAL $ORIGINAL"
echo "SPLITTED $SPLITTED"
#rm -rf $TMP_FILE_IN $TMP_FILE_OUT "$TMP_FILE_OUT.*"

if [ "$ORIGINAL" == "$SPLITTED" ];then
  echo "OK"
else
  echo "md5 sum mismatch"
  exit 1
fi

