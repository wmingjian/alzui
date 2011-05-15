<?php
/**
 * JS代码压缩工具
 */

define('VERSION', '0.1');
define('EOF', false);
define('ORD_NL', ord("\n"));
define('ORD_space', ord(' '));
define('ORD_cA', ord('A'));
define('ORD_cZ', ord('Z'));
define('ORD_a', ord('a'));
define('ORD_z', ord('z'));
define('ORD_0', ord('0'));
define('ORD_9', ord('9'));

class JSMinException extends Exception{
}

class FileOpenFailedJSMinException extends JSMinException{
}

class UnterminatedCommentJSMinException extends JSMinException{
}

class UnterminatedStringLiteralJSMinException extends JSMinException{
}

class UnterminatedRegExpLiteralJSMinException extends JSMinException{
}

class JSMin{
	const ACT_FULL = 1;
	const ACT_BUF = 2;
	const ACT_IMM = 3;
	private $in;
	private $out;
	private $theA;
	private $theB;
	private static function isAlphaNum($c){
		$a = ord($c);
		return
			($a >= ORD_a && $a <= ORD_z) ||
			($a >= ORD_0 && $a <= ORD_9) ||
			($a >= ORD_cA && $a <= ORD_cZ) ||
			$c === '_' || $c === '$' || $c === '\\' || $a > 126
		;
	}
	private function get(){
		$c = $this->in->fgetc();
		if(/*$c == "\t" || */$c == "\r" || $c == "\n" || $c === EOF || ord($c) >= ORD_space){
			return $c;
		}
		//if($c === "\r") return "\n";
		return ' ';
	}
	private function peek(){
		$c = $this->in->fgetc();
		$this->in->fseek(-1, SEEK_CUR);
		return $c;
	}
	private function next(){
		$c = $this->get();
		if($c == '/'){
			switch($this->peek()){
			case '/':
				while(true){
					$c = $this->get();
					if(ord($c) <= ORD_NL){
						return $c;
					}
				}
			case '*':
				while(true){
					$c = $this->get();
					if($c == '*'){
						if($this->peek() == '/'){
							$this->get();
							return ' ';
						}
					}else if($c === EOF){
						throw new UnterminatedCommentJSMinException();
					}
				}
			default:
				return $c;
			}
		}
		return $c;
	}
	private function action($action){
		switch($action){
		case self::ACT_FULL:
			$this->out->fwrite($this->theA);
		case self::ACT_BUF:
			$ch = $this->theA = $this->theB;
			if($ch == '\'' || $ch == '"'){
				while(true){
					$this->out->fwrite($ch);
					$ch = $this->theA = $this->get();
					if($ch == $this->theB){
						break;
					}
					if(ord($ch) <= ORD_NL){
						echo "----" . ord($ch) . "----";
						throw new UnterminatedStringLiteralJSMinException();
					}
					if($ch == '\\'){
						$ch1 = $ch;
						$ch = $this->theA = $this->get();
						if($ch == "\r"){  //续行符
							$ch = $this->theA = $this->get();
							if($ch == "\n")
								$ch = $this->theA = $this->get();
						}else if($ch == "\r"){  //续行符
							$ch = $this->theA = $this->get();
						}else{
							$this->out->fwrite($ch1);
							//$ch = $this->theA = $this->get();
						}
					}
				}
			}
		case self::ACT_IMM:
			$this->theB = $this->next();
			$ch = $this->theA;
			if($this->theB == '/' && ($ch == '(' || $ch == ',' || $ch == '=')){
				$this->out->fwrite($ch);
				$this->out->fwrite($this->theB);
				while(true){
					$ch = $this->theA = $this->get();
					if($ch == '/'){
						break;
					}
					if($ch == '\\'){
						$this->out->fwrite($ch);
						$ch = $this->theA = $this->get();
					}else if(ord($ch) <= ORD_NL){
						throw new UnterminatedRegExpLiteralJSMinException();
					}
					$this->out->fwrite($ch);
				}
				$this->theB = $this->next();
			}
			break;
		default:
			throw new JSMinException('Expected a JSMin :: ACT_* constant in action().');
		}
	}
	public function minify(){
		$this->theA = "";
		$this->action(self::ACT_IMM);
		while($this->theA !== EOF){
			switch($this->theA){
			case ' ':
				if(self::isAlphaNum($this->theB)){
					$this->action(self::ACT_FULL);
				}else{
					$this->action(self::ACT_BUF);
				}
				break;
			case "\r":
			case "\n":
				switch($this->theB){
				case '{': case '[': case '(':
				case '+': case '-':
					$this->action(self::ACT_FULL);
					break;
				case ' ':
					$this->action(self::ACT_IMM);
					break;
				default:
					if(self::isAlphaNum($this->theB)){
						$this->action(self::ACT_FULL);
					}else{
						$this->action(self::ACT_BUF);
					}
					break;
				}
				break;
			default:
				switch($this->theB){
				case ' ':
					if(self::isAlphaNum($this->theA)){
						$this->action(self::ACT_FULL);
						break;
					}
					$this->action(self::ACT_IMM);
					break;
				case "\r":
				case "\n":
					switch($this->theA){
					case '}': case ']': case ')': case '+':
					case '-': case '"': case '\'':
						$this->action(self::ACT_FULL);
						break;
					default:
						if(self::isAlphaNum($this->theA)){
							$this->action(self::ACT_FULL);
						}else{
							$this->action(self::ACT_IMM);
						}
						break;
					}
					break;
				default:
					$this->action(self::ACT_FULL);
					break;
				}
				break;
			}
		}
	}
	public function __construct(/*$inFileName='-', */$outFileName='-', $comments=null){
		//if($inFileName == '-')  $inFileName  = 'php://stdin';
		if($outFileName == '-') $outFileName = 'php://stdout';
		/*
		try{
			$this->in = new SplFileObject($inFileName, 'rb', true);
		}catch(Exception $e){
			throw new FileOpenFailedJSMinException('Failed to open "'.$inFileName.'" for reading only.');
		}
		*/
		try{
			$this->out = new SplFileObject($outFileName, 'wb', true);
		}catch(Exception $e){
			throw new FileOpenFailedJSMinException('Failed to open "'.$outFileName.'" for writing only.');
		}
		/*if($comments !== null){
			foreach($comments as $comm){
				$this->out->fwrite('// '.$comm."\n");
			}
		}*/
	}
	public function minfile($inFileName){
		try{
			$this->in = new SplFileObject($inFileName, 'rb', true);
		}catch(Exception $e){
			throw new FileOpenFailedJSMinException('Failed to open "'.$inFileName.'" for reading only.');
		}
		$this->minify();
	}
	public function putfile($inFileName){
		try{
			$this->in = new SplFileObject($inFileName, 'rb', true);
		}catch(Exception $e){
			throw new FileOpenFailedJSMinException('Failed to open "'.$inFileName.'" for reading only.');
		}
		for($ch = ""; $ch !== EOF; $ch = $this->get()){
			$this->out->fwrite($ch);
		}
	}
	public function putstr($str){
		$this->out->fwrite($str);
	}
	public function test(){
		$jsMin = new JSMin('-', '-', $comments);
		$jsMin->minify();
	}
}